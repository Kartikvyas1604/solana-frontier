import { createHash, randomBytes } from 'crypto';
import nacl from 'tweetnacl';

export function sha256(data: string | Buffer): Buffer {
  return createHash('sha256').update(data).digest();
}

export function sha256Hex(data: string | Buffer): string {
  return sha256(data).toString('hex');
}

export function generateNonce(): string {
  return randomBytes(24).toString('base64');
}

export function verifySignature(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return nacl.sign.detached.verify(message, signature, publicKey);
}

export function signMessage(message: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return nacl.sign.detached(message, secretKey);
}
