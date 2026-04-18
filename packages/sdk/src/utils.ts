import { Connection, PublicKey } from "@solana/web3.js";
import { getVaultPDA } from "./pda";

export async function checkVaultInitialized(connection: Connection): Promise<boolean> {
  try {
    const [vaultPDA] = getVaultPDA();
    const accountInfo = await connection.getAccountInfo(vaultPDA);
    return accountInfo !== null;
  } catch {
    return false;
  }
}
