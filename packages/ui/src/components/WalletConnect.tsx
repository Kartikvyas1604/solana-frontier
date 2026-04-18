import React from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export function WalletConnect() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  return (
    <div className="wallet-connect">
      <WalletMultiButton />
      {connected && publicKey && (
        <div className="wallet-info">
          <p>Connected: {publicKey.toBase58().slice(0, 8)}...</p>
        </div>
      )}
    </div>
  );
}
