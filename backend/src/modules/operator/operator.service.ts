import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { bs58 } from '../../utils/bs58';
import { prisma } from '../../db/client';
import { config } from '../../config';
import { logger } from '../../utils/logger';
import { loadKeypair } from '../../utils/solana';

interface ApprovalData {
  hedgePositionId: string;
  priceAtApproval: number;
  timestamp: number;
  operatorIndex: number;
}

export class OperatorService {
  private operators: Keypair[];

  constructor() {
    this.operators = [
      loadKeypair(config.OPERATOR_1_KEY),
      loadKeypair(config.OPERATOR_2_KEY),
      loadKeypair(config.OPERATOR_3_KEY),
    ];
  }

  async requestApprovals(
    hedgePositionId: string,
    currentPrice: number,
    walletAddress: string
  ): Promise<boolean> {
    const approvals: string[] = [];

    for (let i = 0; i < this.operators.length; i++) {
      const isValid = await this.verifyConditions(currentPrice, walletAddress);

      if (isValid) {
        const signature = this.signApproval({
          hedgePositionId,
          priceAtApproval: currentPrice,
          timestamp: Date.now(),
          operatorIndex: i + 1,
        }, i);

        approvals.push(signature);

        await prisma.operatorApproval.create({
          data: {
            hedgePositionId,
            operatorIndex: i + 1,
            signature,
            priceAtApproval: currentPrice,
          },
        });
      }
    }

    const hasQuorum = approvals.length >= 2;

    if (hasQuorum) {
      logger.info({ hedgePositionId, approvals: approvals.length }, 'Operator quorum reached');
    } else {
      logger.warn({ hedgePositionId, approvals: approvals.length }, 'Failed to reach operator quorum');
    }

    return hasQuorum;
  }

  private signApproval(data: ApprovalData, operatorIndex: number): string {
    const message = JSON.stringify(data);
    const messageBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(messageBytes, this.operators[operatorIndex].secretKey);
    return bs58.encode(signature);
  }

  verifyApproval(signature: string, data: ApprovalData, operatorIndex: number): boolean {
    try {
      const message = JSON.stringify(data);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKey = this.operators[operatorIndex - 1].publicKey.toBytes();

      return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey);
    } catch (error) {
      logger.error({ error }, 'Failed to verify operator signature');
      return false;
    }
  }

  async hasQuorum(hedgePositionId: string): Promise<boolean> {
    const approvals = await prisma.operatorApproval.count({
      where: { hedgePositionId },
    });

    return approvals >= 2;
  }

  private async verifyConditions(currentPrice: number, walletAddress: string): Promise<boolean> {
    const vaultPosition = await prisma.vaultPosition.findFirst({
      where: { walletAddress, status: 'ACTIVE' },
    });

    return vaultPosition !== null && vaultPosition.solAmount > 0 && currentPrice > 0;
  }
}
