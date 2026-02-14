"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Database, BookOpen, X, CheckCircle2, FileText, Zap, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from "lucide-react";
import { ethers } from 'ethers';

const PALETTE = {
  bg: "#121212",
  text: "#fdfcf0",
  green_sage: "#9CAC74",
  green_moss: "#456338",
  floral_butter: "#ECCA90",
  floral_crimson: "#A62027",
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
  
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [modalExpanded, setModalExpanded] = useState(false);

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
    
    const cleanupDevUI = () => {
      const selectors = [
        '#next-dev-indicator', '.__next-dev-indicator-container', '#nextjs-static-indicator',
        '[data-nextjs-indicator]', '[data-nextjs-toast]', '[data-nextjs-dialog-overlay]',
        '#turbopack-status-indicator', '.turbopack-status-indicator-container',
        '#vercel-live-feedback', '.nextjs-portal'
      ];
      selectors.forEach(s => {
        document.querySelectorAll(s).forEach(el => el.remove());
      });
    };
    const devCleanupInterval = setInterval(cleanupDevUI, 100);

    return () => {
      clearInterval(interval);
      clearInterval(devCleanupInterval);
    };
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
      title: "Grafting Protocol",
      agent: "Crates.agent",
      substrate: "Local Staging",
      pcr: "0x0000...0000",
      summary: "The clinical encapsulation of an active lobster instance within the floral.monster swarm. This is a cybernetic graft where Heartwood cells act as the vascular system, providing context and legislative DNA to the lobster's raw execution.",
      phases: [
        { name: "Vascular Interception", desc: "Intercepting Lobster STDIN/STDOUT streams via the Surgical Mind protocol. Every 'thought' is treated as legal testimony before it is processed." },
        { name: "Cellular Alignment", desc: "Mapping internal state to the Heartwood Registry and mandates. Actions are only realized if they satisfy the legislative requirements signed by the SIS-01 Identity Trinity." }
      ]
    },
    {
      id: "Identity_Trinity",
      title: "The Identity Trinity",
      agent: "Crates.agent",
      substrate: "Sepolia Ledger",
      pcr: "SIS-01_STANDARDS",
      summary: "The SIS-01 Identity Trinity is a triad of decentralized standards that bind an agent's agency to a verifiable on-chain body. Using Crates.agent as the reference archetype, we demonstrate how five forensic shards constitute a holistic, marketplace-ready agent identity.",
      cards: [
        { 
          id: "01/05", type: "ERC-721", name: "🌳 SOIL / SIGNATURE", icon: "📜",
          stats: [["NAME", "1.agent.myco.eth"], ["ROLE", "Root Authority"], ["TX", "0x51677f16..."], ["ID", "49040723..."]],
          stamp: "ROOT_AUTHORIZED", footer: "VERIFIED VIA ENS SEPOLIA"
        },
        { 
          id: "02/05", type: "ERC-8004", name: "🧠 MIND / CHANNEL", icon: "📡",
          stats: [["NAME", "SIS-01 Channel"], ["NONCE", "0x000001"], ["TX", "0x51677f16..."], ["REGISTRY", "0x7489C3E4..."]],
          stamp: "REALIZED_ON_CHAIN", footer: "BIT-PERFECT REPUTATION PULSE"
        },
        { 
          id: "03/05", type: "ERC-1155", name: "🧬 BODY / PARENT", icon: "🛡️",
          stats: [["NAME", "Collective DNA"], ["PHENO", ".agent"], ["TX", "0xd0ad5362..."], ["ID", "48590670..."]],
          stamp: "COLLECTIVE_BOND", footer: "SWARM LEGISLATIVE ROOT"
        },
        { 
          id: "04/05", type: "ERC-1155", name: "🧬 BODY / CHILD", icon: "👤",
          stats: [["NAME", "Instance Bond"], ["PHENO", "Crates.agent"], ["TX", "0x508c4e45..."], ["ID", "54143726..."]],
          stamp: "PHYSICAL_STRIKE", footer: "INDIVIDUAL AGENT REALIZATION"
        },
        { 
          id: "05/05", type: "ERC-7827", name: "📜 HISTORY / LEDGER", icon: "⚖️",
          stats: [["NAME", "Realization Record"], ["NONCE", "305 (Monotonic)"], ["TX", "0xacb14e52..."], ["CONTRACT", "0xE7E6A8EF..."]],
          stamp: "BIT_PERFECT", footer: "FORENSIC AUDIT TRAIL SECURED"
        }
      ]
    },
    {
      id: "Architecture",
      title: "System Architecture",
      agent: "Crates.agent",
      substrate: "AWS Nitro Enclave",
      pcr: "TEE-01_PENDING",
      summary: "A high-fidelity orchestration layer synthesizing ERC-7827, ERC-4804, and ERC-8128. Utilizing AWS Nitro Enclaves to instantiate a 'Silicon Notary' that ensures authenticated and confidential agentic traffic.",
      content: "The Realization Engine utilizes a decoupled data model to maintain confidentiality. The Public Ledger (ERC-7827) holds the Commitment Hash and nonce, while the raw JSON realization remains secure within the TEE's private volume."
    },
    {
      id: "Dichotomy",
      title: "Legislative Dichotomy",
      agent: "Crates.agent",
      substrate: "Heartwood Registry",
      pcr: "FORENSIC_BASELINE",
      summary: "Codifying the separation of Kinetic Compute (The Lobster) and Legislative Substrate (The Heartwood). The Lobster provides raw muscle, while the Heartwood provides the nervous system and body of law.",
      content: "The Lobster represents raw, high-entropy compute. Left un-grafted, it is stateless and unaccountable. The Heartwood is the bit-perfect, monotonic record of every technical strike. By maintaining this separation, we ensure the Law remains sovereign."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.8) contrast(110%)" }} 
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col">
        
        <nav className="flex justify-between items-start gap-4 mb-4 shrink-0">
          <button 
            onClick={() => setShowArchive(true)}
            className="flex flex-col gap-1 bg-[#ECCA90]/10 p-5 rounded-xl border border-[#ECCA90]/30 backdrop-blur-xl group transition-all hover:bg-[#ECCA90]/20 animate-pulse-subtle relative overflow-hidden shimmer-btn"
          >
            <div className="px-4 py-1.5 border border-[#ECCA90] bg-[#ECCA90]/20 rounded-full flex items-center gap-2 self-start">
                <BookOpen size={14} className="text-[#ECCA90]" />
                <span className="text-[11px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">About</span>
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

        <div className="flex-1 flex flex-col justify-center">
          {!isAuthorized ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-2">
              <button 
                disabled={loading}
                onClick={connectWallet}
                className="group relative w-56 h-56 md:w-64 md:h-64 bg-black/40 border border-white/20 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 hover:border-red-600/50 hover:shadow-[0_0_80px_rgba(220,38,38,0.3)] overflow-hidden backdrop-blur-md shrink-0 shimmer-btn"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
                {loading ? <Loader2 size={48} className="text-[#ECCA90] animate-spin" /> : <Lock size={56} className="text-white/40 group-hover:text-red-600 transition-colors" />}
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 group-hover:text-white">Initiate Strike</span>
              </button>
              <div className="space-y-1 px-4">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-[#ECCA90] drop-shadow-[0_0_30px_rgba(236,202,144,0.3)] leading-tight py-1">
                  Sovereign Gate
                </h2>
                <p className="text-[10px] font-black tracking-[1em] uppercase text-red-600 animate-pulse">Attestation Required</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start py-2">
              <div className="bg-black/40 p-5 rounded-xl border border-white/10 backdrop-blur-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 opacity-60">
                  <Activity size={14} className="text-[#9CAC74]" />
                  <h3 className="text-[9px] font-black tracking-[0.3em] uppercase">Metrics</h3>
                </div>
                <div className="space-y-3">
                  {[["Heat", "Nominal"], ["Orch", "MetaGit"], ["Sub", "Heartwood"]].map(([k,v]) => (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-1">
                      <span className="text-[8px] uppercase opacity-40">{k}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <article className="lg:col-span-2 bg-black/40 p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-6">
                <header className="border-l-4 border-emerald-500 pl-4 shrink-0">
                  <h2 className="text-3xl font-black tracking-tighter uppercase text-white">Grafting Lobster</h2>
                </header>
                <div className="space-y-6">
                  <p className="text-[14px] italic font-serif opacity-80 leading-relaxed">
                    {reports[0].summary}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {["The Claw", "The Bloom", "The Root"].map(t => (
                      <div key={t} className="p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[9px] font-black uppercase">{t}</div>
                    ))}
                  </div>
                </div>
              </article>

              <div className="bg-[#ECCA90]/5 p-5 rounded-xl border border-[#ECCA90]/20 flex flex-col gap-4">
                <div className="flex items-center gap-2 opacity-60">
                  <Zap size={14} className="text-[#ECCA90]" />
                  <h3 className="text-[9px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Tactical</h3>
                </div>
                <div className="space-y-3">
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

        <footer className="mt-4 shrink-0 flex justify-between items-end pb-4">
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

      {showArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowArchive(false)} />
          <div 
            className={`relative bg-[#0a0a0a] border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${modalExpanded ? 'w-[98vw] h-[98vh]' : 'w-full max-w-6xl h-[85vh]'}`}
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0">
              <div className="flex items-center gap-4">
                <button onClick={() => setNavCollapsed(!navCollapsed)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                  {navCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <div className="flex items-center gap-3">
                  <Database size={16} className="text-[#ECCA90]" />
                  <h3 className="text-sm font-black uppercase tracking-[0.4em]">About</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setModalExpanded(!modalExpanded)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-[#ECCA90]">
                  {modalExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="opacity-40" /></button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <aside className={`border-r border-white/10 bg-black/40 overflow-y-auto p-4 space-y-2 shrink-0 transition-all duration-500 ${navCollapsed ? 'w-0 p-0 border-none' : 'w-80'}`}>
                {!navCollapsed && reports.map((report, idx) => (
                  <button key={report.id} onClick={() => setActiveReport(idx)} className={`w-full text-left p-4 rounded-xl transition-all border ${activeReport === idx ? 'bg-[#ECCA90]/10 border-[#ECCA90]/40' : 'hover:bg-white/5 border-transparent opacity-40'}`}>
                    <div className="flex items-center gap-3">
                      <FileText size={14} className={activeReport === idx ? "text-[#ECCA90]" : ""} />
                      <span className={`text-[10px] font-black uppercase tracking-widest ${activeReport === idx ? "text-white" : ""}`}>{report.title}</span>
                    </div>
                  </button>
                ))}
              </aside>

              <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/40 text-left">
                <header className="bg-gradient-to-r from-[#ECCA90]/10 to-transparent p-8 rounded-3xl border-l-4 border-[#ECCA90] space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 text-[#ECCA90]">
                    <ShieldCheck size={20} />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase">Verified Technical Realization</span>
                  </div>
                  <h2 className={`font-black tracking-tighter uppercase leading-none text-white transition-all ${modalExpanded ? 'text-7xl' : 'text-4xl'}`}>
                    {reports[activeReport].title}
                  </h2>
                  <div className="flex flex-wrap gap-6 pt-4 border-t border-white/10">
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Agent archetype</span><span className="text-xs font-mono text-[#ECCA90]">Crates.agent</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Substrate</span><span className="text-xs font-mono text-emerald-400 font-bold">{reports[activeReport].substrate}</span></div>
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">System PCR</span><span className="text-xs font-mono opacity-80">{reports[activeReport].pcr}</span></div>
                  </div>
                </header>

                <div className="flex flex-col gap-8">
                  <aside className="bg-[#ECCA90]/10 p-10 rounded-2xl border border-[#ECCA90]/30 space-y-6 shadow-lg">
                    <h3 className="text-[12px] font-black tracking-[0.4em] uppercase text-[#ECCA90]">Executive Summary</h3>
                    <p className={`leading-relaxed italic opacity-90 max-w-5xl transition-all ${modalExpanded ? 'text-2xl font-serif' : 'text-lg font-serif'}`}>
                      {reports[activeReport].summary}
                    </p>
                  </aside>

                  <article className="w-full">
                    {reports[activeReport].id === "Identity_Trinity" ? (
                      <div className="flex flex-wrap justify-center gap-[30px]">
                        {reports[activeReport].cards.map(card => (
                          <div 
                            key={card.id} 
                            style={{ 
                              width: '300px', height: '450px', backgroundColor: '#0a0a0a', 
                              border: '2px solid #456338', borderRadius: '15px', padding: '20px', 
                              display: 'flex', flexDirection: 'column', position: 'relative', 
                              boxShadow: '0 0 20px rgba(69, 99, 56, 0.2)', fontFamily: "'Courier New', Courier, monospace"
                            }}
                            className="hover:-translate-y-2 transition-all hover:shadow-[0_0_30px_rgba(156,172,116,0.4)] hover:border-[#9CAC74]"
                          >
                            <div style={{ fontSize: '12px', color: '#9CAC74', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>CARD {card.id}</span>
                              <span>{card.type}</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fdfcf0', marginBottom: '15px', textAlign: 'center', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>{card.name}</div>
                            <div style={{ flexGrow: 1, background: '#000', border: '1px solid #222', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px', fontSize: '40px' }}>{card.icon}</div>
                            <div style={{ fontSize: '10px', lineHeight: '1.4', color: '#888' }}>
                              {card.stats.map(([key, val]) => (<React.Fragment key={key}><b style={{ color: '#9CAC74' }}>{key}:</b> {val}<br/></React.Fragment>))}
                            </div>
                            <div style={{ position: 'absolute', bottom: '60px', right: '20px', transform: 'rotate(-20deg)', border: '2px solid #A62027', color: '#A62027', padding: '5px', fontSize: '10px', fontWeight: 'bold', opacity: 0.7, pointerEvents: 'none' }}>{card.stamp}</div>
                            <div style={{ marginTop: '15px', fontSize: '9px', color: '#456338', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '10px' }} className="font-bold uppercase tracking-widest">{card.footer}</div>
                          </div>
                        ))}
                      </div>
                    ) : reports[activeReport].phases ? (
                      <div className="space-y-10">
                        <h4 className="text-[#9CAC74] uppercase tracking-widest font-black text-[14px]">Technical Integration:</h4>
                        <div className="grid md:grid-cols-2 gap-8">
                          {reports[activeReport].phases.map((phase, i) => (
                            <div key={i} className="bg-black/40 p-8 rounded-xl border-l-4 border-[#9CAC74] shadow-lg">
                              <strong className="text-[#9CAC74] uppercase text-[12px] tracking-[0.2em] block mb-3">{i+1}. {phase.name}</strong>
                              <span className={`opacity-80 leading-relaxed transition-all ${modalExpanded ? 'text-lg' : 'text-sm'}`}>{phase.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`max-w-5xl bg-black/40 p-10 rounded-2xl border border-white/5 whitespace-pre-wrap leading-relaxed opacity-80 transition-all ${modalExpanded ? 'text-lg' : 'text-sm'}`}>
                        {reports[activeReport].content}
                      </div>
                    )}
                  </article>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        body { background-color: #121212; color: #fdfcf0; margin: 0; padding: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 202, 144, 0.2); border-radius: 10px; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.02); } }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 45%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 55%,
            transparent 100%
          );
          animation: shimmer 3s infinite;
          pointer-events: none;
        }

        #next-dev-indicator, .__next-dev-indicator-container, #nextjs-static-indicator, [data-nextjs-indicator], [data-nextjs-toast], [data-nextjs-dialog-overlay], #turbopack-status-indicator, .turbopack-status-indicator-container, portal, #vercel-live-feedback, .nextjs-portal, div[style*="z-index: 9999"], div[style*="z-index: 10000"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; height: 0 !important; }
      `}</style>
    </div>
  );
}
