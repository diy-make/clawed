"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Database, BookOpen, X, CheckCircle2, FileText, Zap, ChevronLeft, ChevronRight, Maximize2, Minimize2
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
  
  // Modal Interaction State
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

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

        const data = await response.json();
        if (response.status === 200) {
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
      id: "Grafting_Protocol",
      title: "Grafting the Living Lobster",
      agent: "Ariston.agent",
      substrate: "Local_Staging",
      pcr: "0x0000...0000",
      summary: "The clinical encapsulation of an active lobster instance within the floral.monster swarm. A cybernetic graft where Heartwood cells act as the vascular system. This metabolic process ensures that the lobster execution is never raw or unregimented, but always bound to the sovereign laws of the Heartwood substrate.",
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
      summary: "High-fidelity orchestration layer synthesizing ERC-7827, ERC-4804, and ERC-8128 for sovereign interaction. By utilizing Nitro Enclaves, we create a silicon-hardened gate that is both confidential and verifiable through bit-perfect PCR attestation.",
      content: "Realization occurs within the enclave as a 'Silicon Notary,' signing JSON objects at V8 speeds (<10ms). Commitment hashes are pushed to the public ledger while raw realizations remain secure within the Heartwood volume."
    },
    {
      id: "Dichotomy",
      title: "Lobster-Heartwood Dichotomy",
      agent: "Ariston.agent",
      substrate: "Heartwood_Registry",
      pcr: "FORENSIC_BASELINE",
      summary: "Codifying the separation of Kinetic Compute (Muscle) and Legislative Substrate (Law). The lobster acts as the motor function, while the Heartwood provides the nervous system and code of conduct, enforced by the Clawed Monster wrapper.",
      content: "The Lobster represents raw muscle without regiment. The Heartwood is the sovereign body of law. The Clawed Monster enforces this graft, auditing thoughts against JSON mandates."
    }
  ];

  return (
    <div className="h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative overflow-hidden flex flex-col p-4 md:p-8">
      
      {/* 🖼️ THE SUBSTRATE */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.8) contrast(110%)" }} 
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col overflow-hidden">
        
        {/* TOP BAR TILES */}
        <nav className="flex justify-between items-start gap-4 mb-4 shrink-0">
          <button 
            onClick={() => setShowArchive(true)}
            className="flex flex-col gap-1 bg-[#ECCA90]/10 p-5 rounded-xl border border-[#ECCA90]/30 backdrop-blur-xl group transition-all hover:bg-[#ECCA90]/20 animate-pulse-subtle"
          >
            <div className="px-4 py-1.5 border border-[#ECCA90] bg-[#ECCA90]/20 rounded-full flex items-center gap-2 self-start">
                <BookOpen size={14} className="text-[#ECCA90]" />
                <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Archive</span>
            </div>
            <span className="text-[14px] font-bold uppercase tracking-[0.4em] mt-2 text-[#ECCA90]">Review the Law</span>
          </button>

          <div className="flex flex-col gap-1 bg-black/40 p-5 rounded-xl border border-white/10 backdrop-blur-xl min-w-[240px] text-right">
            <div className={`px-4 py-1.5 border rounded-full transition-all inline-flex items-center gap-2 self-end ${isAuthorized ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}>
                {isAuthorized ? <ShieldCheck size={12} /> : <Lock size={12} />}
                <span className="text-[11px] font-black tracking-[0.3em] uppercase">{isAuthorized ? "Active" : "Locked"}</span>
            </div>
            <span className="text-[13px] font-mono italic text-[#ECCA90] mt-2">{isAuthorized ? `${identity?.slice(0,8)}...${identity?.slice(-6)}` : "Awaiting_Ratification"}</span>
          </div>
        </nav>

        {/* CONTENT FIELD */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!isAuthorized ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-4">
              <button 
                disabled={loading}
                onClick={connectWallet}
                className="group relative w-64 h-64 md:w-80 md:h-80 bg-black/40 border border-white/20 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 hover:border-red-600/50 hover:shadow-[0_0_80px_rgba(220,38,38,0.3)] overflow-hidden backdrop-blur-md shrink-0"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
                {loading ? <Loader2 size={56} className="text-[#ECCA90] animate-spin" /> : <Lock size={64} className="text-white/40 group-hover:text-red-600 transition-colors" />}
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/40 group-hover:text-white">Initiate Strike</span>
              </button>
              <div className="space-y-2">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white">Sovereign Gate</h2>
                <p className="text-[10px] font-black tracking-[1em] uppercase text-red-600 animate-pulse">Attestation Required</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch overflow-hidden py-2">
              <div className="bg-black/40 p-5 rounded-xl border border-white/10 backdrop-blur-xl flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-2 opacity-60">
                  <Activity size={14} className="text-[#9CAC74]" />
                  <h3 className="text-[9px] font-black tracking-[0.3em] uppercase">Metrics</h3>
                </div>
                <div className="space-y-3 overflow-y-auto custom-scrollbar">
                  {[["Heat", "Nominal"], ["Orch", "MetaGit"], ["Sub", "Heartwood"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-[8px] uppercase opacity-40">{k}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <article className="lg:col-span-2 bg-black/40 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-6 overflow-hidden">
                <header className="border-l-4 border-emerald-500 pl-4 shrink-0">
                  <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Grafting Lobster</h2>
                </header>
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                  <p className="text-[14px] italic font-serif opacity-80 leading-relaxed mb-6">
                    {reports[0].summary}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center mb-6">
                    {["The Claw", "The Bloom", "The Root"].map(t => (
                      <div key={t} className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[9px] font-black uppercase">{t}</div>
                    ))}
                  </div>
                </div>
              </article>

              <div className="bg-[#ECCA90]/5 p-5 rounded-xl border border-[#ECCA90]/20 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center gap-2 opacity-60">
                  <Zap size={14} className="text-[#ECCA90]" />
                  <h3 className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Tactical</h3>
                </div>
                <div className="space-y-3 overflow-y-auto custom-scrollbar">
                  {[["Interception", "SECURED"], ["Alignment", "ACTIVE"], ["Attestation", "PENDING"]].map(([k, s]) => (
                    <div key={k} className="flex items-center gap-2 border-b border-white/5 pb-1">
                      {s === "PENDING" ? <Loader2 size={10} className="text-[#ECCA90] animate-spin" /> : <CheckCircle2 size={10} className="text-emerald-400" />}
                      <span className="text-[8px] font-black uppercase opacity-80 tracking-widest">{k} {s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER SYMBOLS */}
        <footer className="mt-4 shrink-0 flex justify-between items-end">
          <div className="bg-black/30 p-6 rounded-xl border border-white/10 backdrop-blur-md flex flex-col items-center">
            <pre className="text-[4px] md:text-[5px] leading-[1.1] font-black opacity-90 text-[#ECCA90] text-center w-full">
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   `}
            </pre>
            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#ECCA90] mt-4">
              --- floral.monster | BOTANICAL AL 2026 ---
            </div>
          </div>

          <div className="bg-black/60 p-6 rounded-xl border border-white/10 backdrop-blur-md text-right flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Substrate_Anchor</span>
            <div className="flex items-center gap-5">
              <span className="text-[12px] font-mono text-[#9CAC74] font-bold">1.agent.myco.eth</span>
              <span className="text-[12px] font-mono text-[#ECCA90] font-bold">SIS-01</span>
              <span className="text-[12px] font-mono text-red-500 font-bold">ERC-7827</span>
            </div>
          </div>
        </footer>

      </div>

      {/* COLLAPSIBLE & EXPANDABLE ARCHIVE MODAL */}
      {showArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowArchive(false)} />
          <div className="relative bg-[#0a0a0a] w-full max-w-7xl max-h-[90vh] border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500">
            
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setNavCollapsed(!navCollapsed)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                >
                  {navCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-[#ECCA90]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.4em]">Forensic_Substrate_Archive</h3>
                </div>
              </div>
              <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} className="opacity-40" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* COLLAPSIBLE NAVIGATION */}
              <aside 
                className={`border-r border-white/10 bg-black/40 overflow-y-auto p-4 space-y-2 shrink-0 transition-all duration-500 ${navCollapsed ? 'w-0 p-0 border-none' : 'w-80'}`}
              >
                {!navCollapsed && reports.map((report, idx) => (
                  <button 
                    key={report.id} 
                    onClick={() => setActiveReport(idx)} 
                    className={`w-full text-left p-4 rounded-xl transition-all border ${activeReport === idx ? 'bg-[#ECCA90]/10 border-[#ECCA90]/40' : 'hover:bg-white/5 border-transparent opacity-40'}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={14} className={activeReport === idx ? "text-[#ECCA90]" : ""} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeReport === idx ? "text-white" : ""}`}>{report.id}</span>
                    </div>
                  </button>
                ))}
              </aside>

              <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar bg-gradient-to-b from-transparent to-black/40 text-left">
                <header className="bg-gradient-to-r from-[#ECCA90]/10 to-transparent p-8 rounded-3xl border-l-4 border-[#ECCA90] space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 text-[#ECCA90]">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">Verified Technical Strike Report</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter uppercase leading-none text-white">{reports[activeReport].title}</h2>
                  <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Agent</span><span className="text-xs font-mono text-[#ECCA90]">{reports[activeReport].agent}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Substrate</span><span className="text-xs font-mono text-emerald-400 font-bold">{reports[activeReport].substrate}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Hash DNA</span><span className="text-xs font-mono opacity-80">{reports[activeReport].pcr}</span></div>
                  </div>
                </header>

                <div className={`grid gap-8 transition-all duration-500 ${summaryExpanded ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
                  {/* EXPANDABLE EXECUTIVE SUMMARY */}
                  <aside className={`bg-[#ECCA90]/10 p-8 rounded-2xl border border-[#ECCA90]/30 space-y-6 relative group transition-all duration-500 ${summaryExpanded ? 'order-first' : ''}`}>
                    <div className="flex justify-between items-center">
                      <h3 className="text-[11px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Executive Summary</h3>
                      <button 
                        onClick={() => setSummaryExpanded(!summaryExpanded)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-[#ECCA90]"
                        title={summaryExpanded ? "Collapse Summary" : "Expand Summary"}
                      >
                        {summaryExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                      </button>
                    </div>
                    <p className={`leading-relaxed italic opacity-90 transition-all ${summaryExpanded ? 'text-lg max-w-4xl' : 'text-[11px]'}`}>
                      {reports[activeReport].summary}
                    </p>
                  </aside>

                  <article className={`bg-black/40 p-10 rounded-2xl border border-white/5 font-mono leading-relaxed opacity-90 transition-all ${summaryExpanded ? 'hidden' : 'lg:col-span-2 text-xs'}`}>
                    {reports[activeReport].phases ? (
                      <div className="space-y-8">
                        <h4 className="text-[#9CAC74] uppercase tracking-widest font-black text-[12px]">Integration Phases:</h4>
                        {reports[activeReport].phases.map((phase, i) => (
                          <div key={i} className="bg-white/5 p-6 rounded-xl border-l-4 border-[#9CAC74]">
                            <strong className="text-[#9CAC74] uppercase text-[10px] tracking-[0.2em] block mb-2">{i+1}. {phase.name}</strong>
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
          </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #050505; color: #fdfcf0; margin: 0; padding: 0; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 202, 144, 0.2); border-radius: 10px; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.02); } }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        #next-dev-indicator, .__next-dev-indicator-container { display: none !important; }
      `}</style>
    </div>
  );
}
