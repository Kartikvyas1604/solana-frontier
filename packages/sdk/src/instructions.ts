import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { PROGRAM_ID, getVaultPDA, getUserAccountPDA } from "./pda";
import { BN } from "@coral-xyz/anchor";

// Anchor discriminators (first 8 bytes of sha256("global:instruction_name"))
const INITIALIZE_DISCRIMINATOR = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
const DEPOSIT_DISCRIMINATOR = Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]);
const WITHDRAW_DISCRIMINATOR = Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]);

export function createInitializeInstruction(authority: PublicKey): TransactionInstruction {
  const [vault] = getVaultPDA();

  return new TransactionInstruction({
    keys: [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data: INITIALIZE_DISCRIMINATOR,
  });
}

export function createDepositInstruction(
  user: PublicKey,
  amount: bigint
): TransactionInstruction {
  const [vault] = getVaultPDA();
  const [userAccount] = getUserAccountPDA(user);

  const data = Buffer.alloc(16);
  DEPOSIT_DISCRIMINATOR.copy(data, 0);
  const bn = new BN(amount.toString());
  bn.toArrayLike(Buffer, "le", 8).copy(data, 8);

  return new TransactionInstruction({
    keys: [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: userAccount, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });
}

export function createWithdrawInstruction(
  user: PublicKey,
  shares: bigint
): TransactionInstruction {
  const [vault] = getVaultPDA();
  const [userAccount] = getUserAccountPDA(user);

  const data = Buffer.alloc(16);
  WITHDRAW_DISCRIMINATOR.copy(data, 0);
  const bn = new BN(shares.toString());
  bn.toArrayLike(Buffer, "le", 8).copy(data, 8);

  return new TransactionInstruction({
    keys: [
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: userAccount, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });
}
