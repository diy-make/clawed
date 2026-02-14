"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Cpu, Globe, Database, Scale, BookOpen, X, CheckCircle2, FileText
} from "lucide-react";
import { ethers } from 'ethers';

const PALETTE = {
  bg: "#050505",
  text: "#fdfcf0",
  green_sage: "#9CAC74",
  green_moss: "#456338",
  floral_butter: "#ECCA90",
  floral_crimson: "#A62027",
  accent_teal: "#3B6C80",
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
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkStoredAuth = () => {
      const authId = localStorage.getItem('authorized_id');
      const forensicIdentity = localStorage.getItem('forensic_identity');
      const signature = localStorage.getItem('forensic_signature');
      const nonce = localStorage.getItem('forensic_nonce');

      if (authId && forensicIdentity && signature && nonce) {
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
        setIsAuthorized(true);
        setIdentity(userAddress);
      } else {
        setStatus("Access Denied");
        localStorage.removeItem('authorized_id');
        setIsAuthorized(false);
      }
    } catch (error: any) {
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
        await checkAccess(userAddress);
      } catch (error: any) {
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
    setIsAuthorized(false);
    setIdentity(null);
    setStatus(null);
    localStorage.removeItem('forensic_identity');
    localStorage.removeItem('forensic_signature');
    localStorage.removeItem('forensic_nonce');
    localStorage.removeItem('authorized_id');
  };

  const reports = [
    {
      id: "Grafting_Protocol",
      title: "Grafting the Living Lobster",
      agent: "Ariston.agent",
      substrate: "Local_Staging",
      pcr: "0x0000...0000",
      summary: "The clinical encapsulation of an active lobster instance within the floral.monster swarm. A cybernetic graft where Heartwood cells act as the vascular system.",
      phases: [
        { name: "Vascular Interception", desc: "Intercepting Lobster STDIN/STDOUT streams via the Surgical Mind protocol." },
        { name: "Cellular Alignment", desc: "Mapping internal state to the Heartwood Registry and mandates." }
      ]
    },
    {
      id: "Architecture",
      title: "Clawed Monster Architecture",
      agent: "Ariston.agent",
      substrate: "AWS Nitro Enclave",
      pcr: "TEE-01_PENDING",
      summary: "High-fidelity orchestration layer synthesizing ERC-7827, ERC-4804, and ERC-8128 for sovereign interaction.",
      content: "Realization occurs within the enclave as a 'Silicon Notary,' signing JSON objects at V8 speeds (&lt;10ms). Commitment hashes are pushed to the public ledger while raw realizations remain secure."
    },
    {
      id: "Dichotomy",
      title: "Lobster-Heartwood Dichotomy",
      agent: "Ariston.agent",
      substrate: "Heartwood_Registry",
      pcr: "FORENSIC_BASELINE",
      summary: "Codifying the separation of Kinetic Compute (Muscle) and Legislative Substrate (Law).",
      content: "The Lobster represents raw muscle without regiment. The Heartwood is the sovereign body of law. The Clawed Monster enforces this graft, auditing thoughts against JSON mandates."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      
      {/* 🖼️ THE LIVING SUBSTRATE (MAX BRIGHTNESS) */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.9) contrast(110%) saturate(80%)" }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_80%)] opacity-40" />
      </div>

      <div className="relative z-20 min-h-screen w-full flex flex-col p-6 md:p-12">
        
        {/* TOP BAR */}
        <nav className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          {/* 🔱 INVITING ARCHIVE BUTTON */}
          <button 
            onClick={() => setShowArchive(true)}
            className="flex flex-col gap-1 bg-[#ECCA90]/20 p-6 rounded-2xl border border-[#ECCA90]/50 shadow-[0_0_50px_rgba(236,202,144,0.2)] backdrop-blur-2xl w-full md:w-auto min-h-[140px] justify-end group transition-all hover:border-[#ECCA90] hover:bg-[#ECCA90]/30 hover:scale-105 active:scale-95 animate-pulse-subtle cursor-pointer ring-1 ring-white/10"
          >
            <div className="px-4 py-2 border-2 border-[#ECCA90] bg-[#ECCA90]/20 rounded-full transition-all flex items-center gap-2 self-start group-hover:bg-[#ECCA90]/40">
                <BookOpen size={16} className="text-[#ECCA90]" />
                <span className="text-[11px] font-black tracking-[0.4em] uppercase text-[#ECCA90]">
                  FORENSIC_ARCHIVE
                </span>
            </div>
            <div className="flex flex-col items-start mt-3">
              <span className="text-[12px] md:text-[14px] font-black tracking-[0.5em] uppercase ml-1 text-white drop-shadow-md">Review the Law</span>
              <span className="text-[9px] uppercase font-bold tracking-[0.3em] opacity-60 ml-1 text-[#ECCA90]">Architecture & Dichotomy</span>
            </div>
          </button>

          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2 p-6 bg-black/60 rounded-2xl border border-white/20 backdrop-blur-md min-w-[220px] shadow-2xl">
            <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 self-end">Identity_Status</span>
            {isAuthorized ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck size={10} /> Active
                  </span>
                  <span className="text-[9px] font-mono text-[#ECCA90] opacity-80 italic font-bold">{identity?.slice(0,6)}...{identity?.slice(-4)}</span>
                </div>
                <button onClick={disconnectWallet} className="text-[9px] uppercase font-black tracking-widest text-red-500 hover:text-red-400 transition-colors border border-red-500/20 px-2 py-1 rounded-md hover:bg-red-500/10">Revoke</button>
              </div>
            ) : (
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#ECCA90] uppercase opacity-80">Awaiting_Ratification</span>
            )}
          </div>
        </nav>

        {/* 🔱 CENTER LOCK (The Primary Interaction) */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 z-30 w-full">
          <button 
              id="login-button"
              disabled={loading}
              onClick={isAuthorized ? () => {} : connectWallet}
              className={`group relative w-64 h-64 md:w-80 md:h-80 bg-black/40 border rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 overflow-hidden backdrop-blur-md ${isAuthorized ? 'border-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.3)]' : 'border-white/30 hover:border-red-500 hover:shadow-[0_0_100px_rgba(220,38,38,0.4)]'} ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-40 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
              <div className="relative z-10 flex flex-col items-center gap-4">
                {loading ? (
                  <Loader2 size={56} className="text-[#ECCA90] animate-spin" />
                ) : isAuthorized ? (
                  <ShieldCheck size={56} className="text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                ) : (
                  <Lock size={56} className="text-white group-hover:text-red-500 transition-colors duration-500" />
                )}
                <span className={`text-[10px] font-black uppercase tracking-[0.6em] transition-colors duration-500 ${isAuthorized ? 'text-emerald-400' : 'text-white/60 group-hover:text-white'}`}>
                  {loading ? "Forensic Boot..." : isAuthorized ? "Substrate_Live" : "Initiate Strike"}
                </span>
              </div>
              {!isAuthorized && !loading && (
                <div className="absolute inset-0 border-8 border-white/5 rounded-full group-hover:scale-90 transition-transform duration-700" />
              )}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${isAuthorized ? 'bg-gradient-to-t from-emerald-600/30 to-transparent' : 'bg-gradient-to-t from-red-600/30 to-transparent'}`} />
            </button>

            <div className="mt-16 space-y-4">
              <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase text-white filter drop-shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                Sovereign Gate
              </h2>
              <p className={`text-[11px] md:text-sm font-black tracking-[1em] uppercase animate-pulse drop-shadow-md ${isAuthorized ? 'text-emerald-400' : 'text-red-500'}`}>
                {status || (isAuthorized ? "Technical Strikes Secured" : "Attestation Handshake Required")}
              </p>
              <div className="w-24 h-[2px] bg-white/40 mx-auto mt-6 shadow-2xl" />
            </div>
        </div>

        {/* 🔱 ARCHIVE MODAL */}
        {showArchive && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in zoom-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={() => setShowArchive(false)} />
            <div className="relative bg-[#0a0a0a] w-full max-w-6xl max-h-[90vh] border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_150px_rgba(0,0,0,1)]">
              
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#ECCA90]/20 flex items-center justify-center border border-[#ECCA90]/40 text-[#ECCA90]">
                    <Database size={16} />
                  </div>
                  <h3 className="text-sm font-black uppercase tracking-[0.4em]">Forensic_Substrate_Archive</h3>
                </div>
                <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors group">
                  <X size={24} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <aside className="w-full md:w-80 border-r border-white/10 bg-black/40 overflow-y-auto p-4 space-y-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-30 px-4 mb-4 block">Select_Realization</span>
                  {reports.map((report, idx) => (
                    <button 
                      key={report.id}
                      onClick={() => setActiveReport(idx)}
                      className={`w-full text-left p-4 rounded-xl transition-all border ${activeReport === idx ? 'bg-[#ECCA90]/10 border-[#ECCA90]/40' : 'hover:bg-white/5 border-transparent'}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={14} className={activeReport === idx ? "text-[#ECCA90]" : "opacity-40"} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${activeReport === idx ? "text-white" : "opacity-40"}`}>
                          {report.id}
                        </span>
                      </div>
                    </button>
                  ))}
                </aside>

                <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar bg-gradient-to-b from-transparent to-black/40 text-left">
                  <header className="bg-gradient-to-r from-[#ECCA90]/10 to-transparent p-8 rounded-3xl border-l-4 border-[#ECCA90] backdrop-blur-md space-y-4 shadow-xl">
                    <div className="flex items-center gap-3 text-[#ECCA90]">
                      <ShieldCheck size={20} />
                      <span className="text-[10px] font-black tracking-[0.4em] uppercase">Verified Technical Strike Report</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none text-white">
                      {reports[activeReport].title}
                    </h2>
                    <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-40">Agent_Incarnation</span>
                        <span className="text-xs font-mono text-[#ECCA90]">{reports[activeReport].agent}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-40">Substrate</span>
                        <span className="text-xs font-mono text-emerald-400 font-bold">{reports[activeReport].substrate}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase opacity-40">Hash_DNA</span>
                        <span className="text-xs font-mono opacity-80">{reports[activeReport].pcr}</span>
                      </div>
                    </div>
                  </header>

                  <div className="grid lg:grid-cols-3 gap-8">
                    <aside className="space-y-6">
                      <div className="bg-[#ECCA90]/10 p-6 rounded-2xl border border-[#ECCA90]/30 space-y-4">
                        <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Executive Summary</h3>
                        <p className="text-[10px] leading-relaxed italic opacity-90 text-[#fdfcf0]">{reports[activeReport].summary}</p>
                      </div>
                    </aside>
                    <article className="lg:col-span-2 bg-black/40 p-8 rounded-2xl border border-white/5 font-mono text-xs leading-relaxed opacity-90 text-[#fdfcf0]">
                      {reports[activeReport].phases ? (
                        <div className="space-y-6">
                          <h4 className="text-[#9CAC74] uppercase tracking-widest font-black text-[10px]">Metabolic Integration Phases:</h4>
                          {reports[activeReport].phases.map((phase, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border-l-2 border-[#9CAC74]">
                              <strong className="text-[#9CAC74] uppercase text-[9px] tracking-widest block mb-1">{i+1}. {phase.name}</strong>
                              {phase.desc}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{reports[activeReport].content}</p>
                      )}
                    </article>
                  </div>
                </main>
              </div>

              <div className="p-8 bg-black/80 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 opacity-60">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  <span className="text-[8px] font-black uppercase tracking-[0.3em]">Technical Strikes Secured // 2026</span>
                </div>
                <button 
                  onClick={() => setShowArchive(false)}
                  className="px-10 py-4 bg-[#ECCA90] text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 transition-transform shadow-[0_0_40px_rgba(236,202,144,0.3)]"
                >
                  Return to Gate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔱 FOOTER SYMBOLS (BRIGHTER SLOGAN) */}
        <footer className="mt-auto flex flex-col md:flex-row justify-between items-end w-full gap-8">
          <div className="text-center md:text-left bg-black/30 p-6 rounded-2xl border border-white/10 shadow-lg backdrop-blur-md w-full md:w-auto">
            <pre className="text-[5px] md:text-[7px] leading-[1.1] font-black opacity-90 hover:opacity-100 transition-opacity duration-500 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mx-auto md:mx-0 inline-block" style={{ color: PALETTE.floral_butter }}>
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   `}
            </pre>
            <div className="text-[9px] font-black uppercase tracking-[0.6em] text-[#ECCA90] text-center md:text-left mt-4 drop-shadow-md">
              --- MAKE DIY | BOTANICAL AL 2026 ---
            </div>
          </div>

          <div className="bg-black/60 p-6 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto shadow-2xl">
            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40">Anchored_Substrate</span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#9CAC74] font-bold">1.agent.myco.eth</span>
                <span className="text-[10px] font-mono text-[#ECCA90] font-bold">SIS-01 Trinity</span>
                <span className="text-[10px] font-mono text-[#A62027] font-bold">ERC-7827</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <style jsx global>{`
        body { background-color: #050505; cursor: default; color: #fdfcf0; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 202, 144, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(236, 202, 144, 0.4); }
        
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        #next-dev-indicator, 
        .nextjs-static-indicator-container, 
        .__next-dev-indicator-container, 
        #nextjs-static-indicator,
        #turbopack-status-indicator,
        .turbopack-status-indicator-container,
        [data-nextjs-indicator],
        [data-nextjs-toast],
        [data-nextjs-dialog-overlay],
        [data-nextjs-dialog] { 
          display: none !important; 
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
