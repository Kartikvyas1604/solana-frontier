import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { prisma } from '../../db/client';
import { getConnection, verifyTransaction } from '../../utils/solana';
import { logger } from '../../utils/logger';
import fs from 'fs';
import { config } from '../../config';

export class VaultService {
  private connection: Connection;
  private vaultProgramId: PublicKey;

  constructor() {
    this.connection = getConnection();
    this.vaultProgramId = new PublicKey('VauLt11111111111111111111111111111111111111');
  }

  async deposit(walletAddress: string, txSignature: string): Promise<string> {
    const isValid = await verifyTransaction(txSignature, walletAddress);
    if (!isValid) {
      throw new Error('Invalid transaction signature');
    }

    const tx = await this.connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.meta) {
      throw new Error('Transaction not found');
    }

    const preBalance = tx.meta.preBalances[0];
    const postBalance = tx.meta.postBalances[0];
    const solAmount = (preBalance - postBalance) / LAMPORTS_PER_SOL;

    if (solAmount <= 0) {
      throw new Error('Invalid deposit amount');
    }

    await prisma.user.upsert({
      where: { walletAddress },
      create: { walletAddress },
      update: { lastSeen: new Date() },
    });

    const existingPosition = await prisma.vaultPosition.findFirst({
      where: { walletAddress, status: 'ACTIVE' },
    });

    let shares: number;
    if (existingPosition) {
      const totalVaultValue = await this.getTotalVaultValue();
      const totalShares = await this.getTotalShares();
      shares = totalShares > 0 ? (solAmount / totalVaultValue) * totalShares : solAmount;

      await prisma.vaultPosition.update({
        where: { id: existingPosition.id },
        data: {
          solAmount: existingPosition.solAmount + solAmount,
          shares: existingPosition.shares + shares,
        },
      });
    } else {
      shares = solAmount;
      await prisma.vaultPosition.create({
        data: {
          walletAddress,
          solAmount,
          shares,
          status: 'ACTIVE',
        },
      });
    }

    await prisma.auditLog.create({
      data: {
        walletAddress,
        action: 'DEPOSIT',
        metadata: JSON.stringify({ txSignature, solAmount, shares }),
      },
    });

    logger.info({ walletAddress, solAmount, txSignature }, 'Deposit processed');

    return txSignature;
  }

  async withdraw(walletAddress: string, shares: number): Promise<string> {
    if (shares <= 0) {
      throw new Error('Invalid shares amount');
    }

    const vaultPosition = await prisma.vaultPosition.findFirst({
      where: { walletAddress, status: 'ACTIVE' },
    });

    if (!vaultPosition) {
      throw new Error('No active vault position found');
    }

    if (vaultPosition.shares < shares) {
      throw new Error('Insufficient shares');
    }

    const openHedge = await prisma.hedgePosition.findFirst({
      where: { walletAddress, status: 'OPEN' },
    });

    if (openHedge) {
      throw new Error('Cannot withdraw with active hedge. Close hedge first.');
    }

    const totalVaultValue = await this.getTotalVaultValue();
    const totalShares = await this.getTotalShares();
    const solAmount = (shares / totalShares) * totalVaultValue;

    const vaultKeypair = JSON.parse(fs.readFileSync(config.VAULT_KEYPAIR_PATH, 'utf-8'));
    const fromPubkey = new PublicKey(vaultKeypair.publicKey);
    const toPubkey = new PublicKey(walletAddress);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: solAmount * LAMPORTS_PER_SOL,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPubkey;

    const txSignature = await this.connection.sendTransaction(transaction, []);
    await this.connection.confirmTransaction(txSignature);

    await prisma.vaultPosition.update({
      where: { id: vaultPosition.id },
      data: {
        solAmount: vaultPosition.solAmount - solAmount,
        shares: vaultPosition.shares - shares,
        status: vaultPosition.shares - shares === 0 ? 'WITHDRAWN' : 'ACTIVE',
      },
    });

    await prisma.auditLog.create({
      data: {
        walletAddress,
        action: 'WITHDRAW',
        metadata: JSON.stringify({ shares, solAmount, txSignature }),
      },
    });

    logger.info({ walletAddress, shares, solAmount, txSignature }, 'Withdrawal processed');

    return txSignature;
  }

  async getState(walletAddress: string) {
    const vaultPosition = await prisma.vaultPosition.findFirst({
      where: { walletAddress, status: 'ACTIVE' },
    });

    const activeHedge = await prisma.hedgePosition.findFirst({
      where: { walletAddress, status: 'OPEN' },
    });

    const totalVaultValue = await this.getTotalVaultValue();
    const totalShares = await this.getTotalShares();

    let currentValue = 0;
    if (vaultPosition && totalShares > 0) {
      currentValue = (vaultPosition.shares / totalShares) * totalVaultValue;
    }

    return {
      vaultPosition: vaultPosition ? {
        solAmount: vaultPosition.solAmount,
        shares: vaultPosition.shares,
        currentValue,
        depositedAt: vaultPosition.depositedAt,
      } : null,
      activeHedge: activeHedge ? {
        id: activeHedge.id,
        entryPrice: activeHedge.entryPrice,
        shortSizeSol: activeHedge.shortSizeSol,
        entryTimestamp: activeHedge.entryTimestamp,
      } : null,
    };
  }

  private async getTotalVaultValue(): Promise<number> {
    const result = await prisma.vaultPosition.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { solAmount: true },
    });
    return result._sum.solAmount || 0;
  }

  private async getTotalShares(): Promise<number> {
    const result = await prisma.vaultPosition.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { shares: true },
    });
    return result._sum.shares || 0;
  }
}
