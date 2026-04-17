'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { api } from '@/lib/api';
import bs58 from 'bs58';

export function useShieldVault() {
  const { publicKey, signMessage, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [vaultState, setVaultState] = useState<any>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [activeHedge, setActiveHedge] = useState<any>(null);
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const signAuthMessage = useCallback(async () => {
    if (!publicKey || !signMessage) throw new Error('Wallet not connected');

    const message = `ShieldVault Auth: ${Date.now()}`;
    const encodedMessage = new TextEncoder().encode(message);
    const signature = await signMessage(encodedMessage);

    return {
      signature: bs58.encode(signature),
      message,
    };
  }, [publicKey, signMessage]);

  const loadVaultState = useCallback(async () => {
    if (!publicKey) return;

    try {
      const state = await api.vault.getState(publicKey.toBase58());
      setVaultState(state);
    } catch (error) {
      console.error('Failed to load vault state:', error);
    }
  }, [publicKey]);

  const loadPrice = useCallback(async () => {
    try {
      const price = await api.price.current();
      setPriceData(price);
    } catch (error) {
      console.error('Failed to load price:', error);
    }
  }, []);

  const loadActiveHedge = useCallback(async () => {
    if (!publicKey) return;

    try {
      const hedge = await api.hedge.active(publicKey.toBase58());
      setActiveHedge(hedge);
    } catch (error) {
      setActiveHedge(null);
    }
  }, [publicKey]);

  const loadPolicy = useCallback(async () => {
    if (!publicKey) return;

    try {
      const pol = await api.policy.get(publicKey.toBase58());
      setPolicy(pol);
    } catch (error) {
      setPolicy(null);
    }
  }, [publicKey]);

  const deposit = useCallback(async (amount: number) => {
    if (!publicKey || !signTransaction) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const vaultPubkey = new PublicKey(process.env.NEXT_PUBLIC_VAULT_ADDRESS!);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: vaultPubkey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey;

      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      await api.vault.deposit(publicKey.toBase58(), signature);
      await loadVaultState();

      return signature;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signTransaction, connection, loadVaultState]);

  const withdraw = useCallback(async (shares: number) => {
    if (!publicKey) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const auth = await signAuthMessage();
      await api.vault.withdraw(publicKey.toBase58(), shares, auth.signature, auth.message);
      await loadVaultState();
    } finally {
      setLoading(false);
    }
  }, [publicKey, signAuthMessage, loadVaultState]);

  const createPolicy = useCallback(async (params: {
    triggerPercent: number;
    hedgePercent: number;
    timeoutMinutes: number;
  }) => {
    if (!publicKey) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const auth = await signAuthMessage();
      await api.policy.create(publicKey.toBase58(), params, auth.signature, auth.message);
      await loadPolicy();
    } finally {
      setLoading(false);
    }
  }, [publicKey, signAuthMessage, loadPolicy]);

  const closeHedge = useCallback(async () => {
    if (!publicKey) throw new Error('Wallet not connected');

    setLoading(true);
    try {
      const auth = await signAuthMessage();
      await api.hedge.close(publicKey.toBase58(), auth.signature, auth.message);
      await loadActiveHedge();
    } finally {
      setLoading(false);
    }
  }, [publicKey, signAuthMessage, loadActiveHedge]);

  useEffect(() => {
    if (publicKey) {
      loadVaultState();
      loadPolicy();
      loadActiveHedge();
    }
  }, [publicKey, loadVaultState, loadPolicy, loadActiveHedge]);

  useEffect(() => {
    loadPrice();
    const interval = setInterval(loadPrice, 5000);
    return () => clearInterval(interval);
  }, [loadPrice]);

  return {
    connected: !!publicKey,
    walletAddress: publicKey?.toBase58(),
    vaultState,
    priceData,
    activeHedge,
    policy,
    loading,
    deposit,
    withdraw,
    createPolicy,
    closeHedge,
    refresh: () => {
      loadVaultState();
      loadPrice();
      loadActiveHedge();
      loadPolicy();
    },
  };
}
