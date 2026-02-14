"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Lock, ShieldCheck } from 'lucide-react';

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const CLICKWRAP_MESSAGE = (nonce: string) => `I agree to enter the metagit feed. Session Nonce: ${nonce}`;

export default function WalletConnect() {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedIdentity = localStorage.getItem('forensic_identity');
    const signature = localStorage.getItem('forensic_signature');
    const nonce = localStorage.getItem('forensic_nonce');

    if (storedIdentity && signature && nonce) {
      setAddress(storedIdentity);
      checkAccess(storedIdentity, false);
    }
  }, []);

  const checkAccess = async (userAddress: string, forceSignature: boolean = true) => {
    setLoading(true);
    try {
      const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
      if (!ethereum && forceSignature) return;

      let signature = localStorage.getItem('forensic_signature');
      let nonce = localStorage.getItem('forensic_nonce');

      if (forceSignature || !signature || !nonce) {
        if (!ethereum) return;
        const provider = new ethers.BrowserProvider(ethereum as any);
        nonce = Date.now().toString();
        const signer = await provider.getSigner();
        signature = await signer.signMessage(CLICKWRAP_MESSAGE(nonce));
        localStorage.setItem('forensic_nonce', nonce);
        localStorage.setItem('forensic_signature', signature);
      }

      const response = await fetch('/api/auth/gatekeeper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature, nonce })
      });

      const data = await response.json();

      if (response.status === 200) {
        setStatus("Active");
        localStorage.setItem('forensic_identity', userAddress);
        if (data.authorizedId) {
          localStorage.setItem('authorized_id', data.authorizedId);
        }
      } else {
        setStatus("Access Denied");
      }
    } catch (error: unknown) {
      console.error("Verification Error:", error);
      setStatus("Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
    
    if (typeof window !== 'undefined' && ethereum) {
      try {
        setLoading(true);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        const userAddress = accounts[0];
        setAddress(userAddress);
        await checkAccess(userAddress);
      } catch (error: unknown) {
        console.error("Connection Error:", error);
      } finally {
        setLoading(false);
      }
    } else {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `https://metamask.app.link/dapp/${window.location.host}`;
      } else {
        alert("Web3 Browser Required: Please install MetaMask or use a compatible browser.");
      }
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setStatus(null);
    localStorage.removeItem('forensic_identity');
    localStorage.removeItem('forensic_signature');
    localStorage.removeItem('forensic_nonce');
    localStorage.removeItem('authorized_id');
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {address ? (
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-500">
          <div className="flex flex-col items-end border-r border-[#b4941f]/30 pr-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className={status === "Active" ? "text-emerald-500" : "text-red-500"} />
                <span className="text-[9px] text-[#b4941f] uppercase tracking-widest font-bold">
                  {status || "Authenticating..."}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#fdfcf0] opacity-40 font-mono tracking-tighter">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-[9px] uppercase tracking-tighter text-[#b4941f] hover:text-red-400 transition-colors active:scale-95"
          >
            Revoke
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 w-full max-w-[280px]">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-4 border-2 border-[#b4941f]/30 hover:border-[#b4941f] text-[#b4941f] rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-[#b4941f]/10 active:scale-95 disabled:opacity-50 w-full cursor-pointer touch-manipulation whitespace-nowrap"
          >
            {loading ? (
              <span className="animate-pulse">Forensic Boot...</span>
            ) : (
              <>
                <Lock size={12} className="shrink-0" />
                <span>Authorize Session</span>
              </>
            )}
          </button>
          {status && status !== "Active" && (
            <span className="text-[9px] text-red-400 font-mono uppercase tracking-tighter animate-pulse">
              Error: {status}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
