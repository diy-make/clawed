"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Cpu, Globe, Database, Scale, BookOpen, X, CheckCircle2, FileText, Zap
} from "lucide-react";
import { ethers } from 'ethers';

const PALETTE = {
  bg: "#050505",
  text: "#fdfcf0",
  green_sage: "#9CAC74",
  floral_butter: "#ECCA90",
};

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}

const CLICKWRAP_MESSAGE = (nonce: string) => `I agree to enter the metagit feed. Session Nonce: ${nonce}`;

export default function ClawedMonsterHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [activeReport, setActiveReport] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStoredAuth = () => {
      const authId = localStorage.getItem('authorized_id');
      const forensicIdentity = localStorage.getItem('forensic_identity');
      if (authId && forensicIdentity) {
        setIsAuthorized(true);
        setIdentity(forensicIdentity);
      } else {
        setIsAuthorized(false);
        setIdentity(null);
      }
    };
    checkStoredAuth();
    const interval = setInterval(checkStoredAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  const connectWallet = async () => {
    const ethereum = (window as { ethereum?: EthereumProvider }).ethereum;
    if (typeof window !== 'undefined' && ethereum) {
      try {
        setLoading(true);
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[];
        const userAddress = accounts[0];
        const provider = new ethers.BrowserProvider(ethereum as any);
        const nonce = Date.now().toString();
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(CLICKWRAP_MESSAGE(nonce));

        const response = await fetch('/api/auth/gatekeeper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: userAddress, signature, nonce })
        });

        if (response.status === 200) {
          const data = await response.json();
          localStorage.setItem('forensic_identity', userAddress);
          localStorage.setItem('forensic_signature', signature);
          localStorage.setItem('forensic_nonce', nonce);
          localStorage.setItem('authorized_id', data.authorizedId || 'SIS01_VISITOR');
          setIsAuthorized(true);
          setIdentity(userAddress);
        } else {
          alert("Access Denied: SIS-01 Identity Shard not found.");
        }
      } catch (error: any) {
        console.error("Connection Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const reports = [
    {
      id: "Architecture",
      title: "Clawed Monster Architecture",
      agent: "Ariston.agent",
      summary: "High-fidelity TEE orchestration layer synthesizing ERC-7827 and forensic protocols.",
      content: "Realization occurs within an AWS Nitro Enclave as a 'Silicon Notary.' Commitment hashes are pushed to the public ledger while raw realizations remain secure."
    },
    {
      id: "Dichotomy",
      title: "Lobster-Heartwood Dichotomy",
      agent: "Ariston.agent",
      summary: "Codifying the separation of Kinetic Compute (Muscle) and Legislative Substrate (Law).",
      content: "The Lobster represents raw muscle without regiment. The Heartwood is the sovereign body of law. The Clawed Monster enforces this graft."
    }
  ];

  return (
    <div className="h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative overflow-hidden flex flex-col p-6 md:p-8">
      
      {/* 🖼️ THE SUBSTRATE */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.8) contrast(110%)" }} 
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* 🔱 TOP NAVIGATION TILES */}
      <nav className="relative z-20 flex justify-between items-start gap-4 mb-4">
        <button 
          onClick={() => setShowArchive(true)}
          className="flex flex-col gap-1 bg-[#ECCA90]/10 p-4 rounded-xl border border-[#ECCA90]/30 backdrop-blur-xl group transition-all hover:bg-[#ECCA90]/20 animate-pulse-subtle"
        >
          <div className="flex items-center gap-2 border border-[#ECCA90]/40 px-2 py-0.5 rounded-full bg-[#ECCA90]/10">
            <BookOpen size={12} className="text-[#ECCA90]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#ECCA90]">Archive</span>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] mt-1">Review the Law</span>
        </button>

        <div className="flex flex-col gap-1 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-xl min-w-[180px] text-right">
          <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full self-end border ${isAuthorized ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}>
            <span className="text-[9px] font-black uppercase tracking-widest">{isAuthorized ? "Active" : "Locked"}</span>
          </div>
          <span className="text-[11px] font-mono italic text-[#ECCA90] mt-1">{isAuthorized ? `${identity?.slice(0,6)}...${identity?.slice(-4)}` : "Awaiting_Ratification"}</span>
        </div>
      </nav>

      {/* 🔱 MAIN ACTION FIELD: FIXED HEIGHT NO SCROLL */}
      <div className="relative z-20 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center overflow-hidden">
        
        {/* SYSTEM METRICS TILE */}
        <div className="bg-black/40 p-5 rounded-xl border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 opacity-60">
            <Activity size={14} className="text-[#9CAC74]" />
            <h3 className="text-[9px] font-black tracking-widest uppercase">System_Metrics</h3>
          </div>
          <div className="space-y-2">
            {[["Heat", "Nominal"], ["Orch", "MetaGit"], ["Sub", "Heartwood"]].map(([k,v]) => (
              <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                <span className="text-[8px] uppercase opacity-40">{k}</span>
                <span className="text-[9px] font-mono text-emerald-400">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER GATE: SCALED TO FIT */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-8">
          <button 
            disabled={loading}
            onClick={isAuthorized ? () => {} : connectWallet}
            className={`group relative w-56 h-56 md:w-72 md:h-72 bg-black/40 border rounded-full flex flex-col items-center justify-center gap-3 transition-all duration-700 ${isAuthorized ? 'border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]' : 'border-white/20 hover:border-red-600/50 hover:shadow-[0_0_60px_rgba(220,38,38,0.3)]'}`}
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
            {loading ? <Loader2 size={40} className="text-[#ECCA90] animate-spin" /> : isAuthorized ? <ShieldCheck size={48} className="text-emerald-500" /> : <Lock size={48} className="text-white/40 group-hover:text-red-600" />}
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white">
              {loading ? "Booting..." : isAuthorized ? "Live" : "Initiate"}
            </span>
            <div className="absolute inset-0 border-4 border-white/5 rounded-full group-hover:scale-95 transition-transform duration-700" />
          </button>
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Sovereign Gate</h2>
            <p className="text-[9px] font-black tracking-[0.5em] uppercase text-red-600 animate-pulse mt-2">Attestation Required</p>
          </div>
        </div>

        {/* TACTICAL CHORD TILE */}
        <div className="bg-[#ECCA90]/5 p-5 rounded-xl border border-[#ECCA90]/20 space-y-4">
          <div className="flex items-center gap-2 opacity-60">
            <Zap size={14} className="text-[#ECCA90]" />
            <h3 className="text-[9px] font-black tracking-widest uppercase text-[#ECCA90]">Tactical_Chord</h3>
          </div>
          <div className="space-y-3">
            {[["Interception", "SECURED"], ["Alignment", "ACTIVE"], ["Attestation", "PENDING"]].map(([k, s]) => (
              <div key={k} className="flex items-center gap-2 border-b border-white/5 pb-1">
                {s === "PENDING" ? <Loader2 size={10} className="text-[#ECCA90] animate-spin" /> : <CheckCircle2 size={10} className="text-emerald-400" />}
                <span className={`text-[8px] font-black uppercase tracking-widest ${s === "PENDING" ? 'text-[#ECCA90]' : 'opacity-80'}`}>{k} {s}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 🔱 FOOTER: AT THE VERY BOTTOM */}
      <footer className="relative z-20 flex justify-between items-end mt-auto">
        <div className="flex flex-col gap-2">
          <pre className="text-[4px] md:text-[5px] leading-[1.1] font-black opacity-40 text-[#ECCA90]">
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   `}
          </pre>
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ECCA90] opacity-80">
            --- floral.monster | BOTANICAL AL 2026 ---
          </div>
        </div>
        <div className="flex gap-4 opacity-30 text-[8px] font-mono uppercase tracking-widest">
          <span>1.agent.myco.eth</span>
          <span>ERC-7827</span>
        </div>
      </footer>

      {/* ARCHIVE MODAL (UNCHANGED LOGIC) */}
      {showArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setShowArchive(false)} />
          <div className="relative bg-[#0a0a0a] w-full max-w-4xl max-h-[80vh] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-white/5 flex justify-between items-center"><h3 className="text-[10px] font-black uppercase tracking-widest text-[#ECCA90]">Substrate_Archive</h3><button onClick={() => setShowArchive(false)}><X size={20} /></button></div>
            <div className="flex-1 flex overflow-hidden">
              <aside className="w-48 border-r border-white/5 p-4 space-y-2">{reports.map((r, i) => (<button key={i} onClick={() => setActiveReport(i)} className={`w-full text-left p-3 rounded-lg text-[9px] font-black uppercase border ${activeReport === i ? 'bg-[#ECCA90]/10 border-[#ECCA90]/40' : 'border-transparent opacity-40'}`}>{r.id}</button>))}</aside>
              <main className="flex-1 p-8 overflow-y-auto custom-scrollbar text-left"><header className="border-l-4 border-[#ECCA90] pl-4 mb-6"><h4 className="text-2xl font-black uppercase">{reports[activeReport].title}</h4></header><div className="bg-white/5 p-6 rounded-xl font-mono text-[10px] leading-relaxed opacity-90">{reports[activeReport].content}</div></main>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #050505; color: #fdfcf0; margin: 0; padding: 0; overflow: hidden; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        #next-dev-indicator, .__next-dev-indicator-container { display: none !important; }
      `}</style>
    </div>
  );
}