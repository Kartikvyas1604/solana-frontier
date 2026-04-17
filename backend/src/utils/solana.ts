import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { bs58 } from './bs58';
import { config } from '../config';

export function getConnection(): Connection {
  return new Connection(config.SOLANA_RPC_URL, 'confirmed');
}

export function loadKeypair(base58Key: string): Keypair {
  const secretKey = bs58.decode(base58Key);
  return Keypair.fromSecretKey(secretKey);
}

export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = bs58.decode(signature);
    const publicKeyBytes = new PublicKey(publicKey).toBytes();

    return nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
  } catch (error) {
    return false;
  }
}

export async function verifyTransaction(
  txSignature: string,
  expectedSigner: string
): Promise<boolean> {
  const connection = getConnection();

  try {
    const tx = await connection.getTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
    });

    if (!tx || !tx.transaction) {
      return false;
    }

    const signers = tx.transaction.message.staticAccountKeys;
    return signers.some(key => key.toBase58() === expectedSigner);
  } catch (error) {
    return false;
  }
}
