import { useEffect, useState } from 'react';
import { Check, Copy, LogOut, Wallet, X } from 'lucide-react';
import { getAddress, isConnected, requestAccess } from '@stellar/freighter-api';
import type { WalletConnectionProps } from '@/types';

function shortenAddress(address: string): string {
  return `${address.slice(0, 5)}…${address.slice(-5)}`;
}

export default function WalletConnection({ publicKey, onConnect, onDisconnect }: WalletConnectionProps) {
  const [isFreighterInstalled, setIsFreighterInstalled] = useState<boolean | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void isConnected()
      .then(({ isConnected: connected, error: apiError }) => {
        if (isMounted) {
          setIsFreighterInstalled(!apiError && connected);
        }
      })
      .catch(() => {
        if (isMounted) setIsFreighterInstalled(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function connectWallet(): Promise<void> {
    setIsConnecting(true);
    setError(null);
    try {
      const response = await requestAccess();
      if (response.error) throw new Error(response.error.message);
      if (!response.address) throw new Error('Freighter did not return a public key.');
      onConnect(response.address);
      setIsFreighterInstalled(true);
    } catch (connectionError) {
      setError(connectionError instanceof Error ? connectionError.message : 'Unable to connect to Freighter.');
    } finally {
      setIsConnecting(false);
    }
  }

  async function copyAddress(): Promise<void> {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  if (publicKey) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={copyAddress} className="address-pill" title="Copy public key">
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span>{shortenAddress(publicKey)}</span>
        </button>
        <button onClick={onDisconnect} className="icon-button" title="Disconnect wallet" aria-label="Disconnect wallet">
          <LogOut size={17} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button onClick={() => void connectWallet()} disabled={isConnecting} className="primary-button">
        <Wallet size={17} />
        {isConnecting ? 'Connecting…' : 'Connect Freighter'}
      </button>
      {error && (
        <div className="absolute right-0 top-14 z-20 flex w-72 items-start gap-2 rounded-xl border border-red-200 bg-white p-3 text-xs text-red-700 shadow-xl">
          <X size={15} className="mt-0.5 shrink-0" />
          <span>{isFreighterInstalled === false ? 'Install the Freighter wallet extension, then try again.' : error}</span>
        </div>
      )}
    </div>
  );
}
