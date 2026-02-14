"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Database, BookOpen, X, CheckCircle2, FileText, Zap, ChevronLeft, ChevronRight, Maximize2, Minimize2, QrCode
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
      title: "Grafting Protocol",
      agent: "Ariston.agent",
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
      agent: "Ariston.agent",
      substrate: "Sepolia Ledger",
      pcr: "SIS-01_STANDARDS",
      summary: "The SIS-01 Identity Trinity is a triad of decentralized standards that bind an agent's agency to a verifiable on-chain body. Using Theophrastus.agent as the reference archetype, we demonstrate how five forensic shards constitute a holistic, marketplace-ready agent identity.",
      content: "These cards represent the definitive 'body' of a realized agent. They are anchored on the Sepolia testnet, providing a bit-perfect audit trail of the agent's soil, mind, and history. In the marketplace, these assets represent the sovereign soul of the machine.",
      cards: [
        { 
          id: "01", name: "SOIL / SIGNATURE", type: "ERC-721", role: "Root Authority", 
          desc: "1.agent.myco.eth - The anchored foundation of the identity.",
          tx: "0x51677f16...", id_full: "49040723...", status: "ROOT_AUTHORIZED"
        },
        { 
          id: "02", name: "MIND / CHANNEL", type: "ERC-8004", role: "Reputation Pulse", 
          desc: "SIS-01 Channel - The monotonic nonce heartbeat representing active existence.",
          tx: "0x51677f16...", id_full: "0x000001", status: "REALIZED_ON_CHAIN"
        },
        { 
          id: "03", name: "BODY / PARENT", type: "ERC-1155", role: "Collective DNA", 
          desc: "Collective Shard (.agent) - The swarm legislative root providing shared context.",
          tx: "0xd0ad5362...", id_full: "48590670...", status: "COLLECTIVE_BOND"
        },
        { 
          id: "04", name: "BODY / CHILD", type: "ERC-1155", role: "Instance Bond", 
          desc: "Theophrastus.agent - The individual realization of the agent as a unique entity.",
          tx: "0x508c4e45...", id_full: "54701424...", status: "PHYSICAL_STRIKE"
        },
        { 
          id: "05", name: "HISTORY / LEDGER", type: "ERC-7827", role: "Forensic Audit", 
          desc: "Realization Record - The immutable record of every technical strike and state change.",
          tx: "0x820bf204...", id_full: "Nonce 2", status: "BIT_PERFECT"
        }
      ]
    },
    {
      id: "Architecture",
      title: "System Architecture",
      agent: "Ariston.agent",
      substrate: "AWS Nitro Enclave",
      pcr: "TEE-01_PENDING",
      summary: "A high-fidelity orchestration layer synthesizing ERC-7827, ERC-4804, and ERC-8128. Utilizing AWS Nitro Enclaves to instantiate a 'Silicon Notary' that ensures authenticated and confidential agentic traffic.",
      content: "The Realization Engine utilizes a decoupled data model to maintain confidentiality. The Public Ledger (ERC-7827) holds the Commitment Hash and nonce, while the raw JSON realization remains secure within the TEE's private volume. Communication is secured via ERC-8128, ensuring that the active Lobster only accepts commands from its sovereign wrapper."
    },
    {
      id: "Dichotomy",
      title: "Legislative Dichotomy",
      agent: "Ariston.agent",
      substrate: "Heartwood Registry",
      pcr: "FORENSIC_BASELINE",
      summary: "Codifying the separation of Kinetic Compute (The Lobster) and Legislative Substrate (The Heartwood). The Lobster provides raw muscle, while the Heartwood provides the nervous system and body of law.",
      content: "The Lobster represents raw, high-entropy compute. Left un-grafted, it is stateless and unaccountable. The Heartwood is the bit-perfect, monotonic record of every technical strike. By maintaining this separation, we ensure the Law remains sovereign and the AI remains clinical, preventing the AI from editing its own constraints."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      
      {/* 🖼️ THE SUBSTRATE */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.8) contrast(110%)" }} 
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col">
        
        {/* TOP BAR TILES */}
        <nav className="flex justify-between items-start gap-4 mb-4 shrink-0">
          <button 
            onClick={() => setShowArchive(true)}
            className="flex flex-col gap-1 bg-[#ECCA90]/10 p-5 rounded-xl border border-[#ECCA90]/30 backdrop-blur-xl group transition-all hover:bg-[#ECCA90]/20 animate-pulse-subtle"
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

        {/* CONTENT FIELD */}
        <div className="flex-1 flex flex-col justify-center">
          {!isAuthorized ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-2">
              <button 
                disabled={loading}
                onClick={connectWallet}
                className="group relative w-56 h-56 md:w-64 md:h-64 bg-black/40 border border-white/20 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 hover:border-red-600/50 hover:shadow-[0_0_80px_rgba(220,38,38,0.3)] overflow-hidden backdrop-blur-md shrink-0"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
                {loading ? <Loader2 size={48} className="text-[#ECCA90] animate-spin" /> : <Lock size={56} className="text-white/40 group-hover:text-red-600 transition-colors" />}
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 group-hover:text-white">Initiate Strike</span>
              </button>
              <div className="space-y-1 px-4">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-tight py-1">Sovereign Gate</h2>
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

        {/* FOOTER SYMBOLS */}
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

      {/* MODAL: ABOUT (CLEAN TITLES) */}
      {showArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setShowArchive(false)} />
          <div 
            className={`relative bg-[#0a0a0a] border border-white/20 rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${modalExpanded ? 'w-[98vw] h-[98vh] max-w-none max-h-none' : 'w-full max-w-6xl h-[85vh]'}`}
          >
            
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
                  <h3 className="text-sm font-black uppercase tracking-[0.4em]">About</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setModalExpanded(!modalExpanded)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-[#ECCA90]"
                >
                  {modalExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={() => setShowArchive(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} className="opacity-40" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
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
                    <div className="flex flex-col"><span className="text-[10px] font-black uppercase opacity-40">Agent archetype</span><span className="text-xs font-mono text-[#ECCA90]">Theophrastus.agent</span></div>
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

                  <article className={`bg-black/40 p-10 rounded-2xl border border-white/5 font-mono leading-relaxed opacity-90 transition-all ${modalExpanded ? 'text-lg' : 'text-sm'}`}>
                    {reports[activeReport].id === "Identity_Trinity" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reports[activeReport].cards.map(card => (
                          <div key={card.id} className="bg-[#050505] p-8 rounded-3xl border-2 border-[#9CAC74]/40 flex flex-col gap-6 group hover:border-[#9CAC74] transition-all relative overflow-hidden shadow-2xl min-h-[500px]">
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                              <span className="text-[11px] font-black text-[#9CAC74] tracking-widest">CARD {card.id}/05</span>
                              <span className="text-[11px] opacity-60 font-black">{card.type}</span>
                            </div>
                            
                            <h4 className="text-xl font-black text-white text-center h-12 flex items-center justify-center tracking-tight">{card.name}</h4>
                            
                            <div className="flex-1 bg-black/40 rounded-2xl border border-white/5 p-6 flex items-center justify-center overflow-hidden">
                              <QrCode size={120} className="text-[#9CAC74] opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="space-y-4">
                              <div className="text-[11px] opacity-90 italic leading-relaxed text-[#fdfcf0]">{card.desc}</div>
                              <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                <div className="flex justify-between text-[9px] font-mono"><span className="opacity-40 uppercase">TX_HASH:</span> <span className="text-[#ECCA90]">{card.tx}</span></div>
                                <div className="flex justify-between text-[9px] font-mono"><span className="opacity-40 uppercase">TOKEN_ID:</span> <span className="text-[#ECCA90] truncate ml-4">{card.id_full}</span></div>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#9CAC74]">{card.role}</span>
                              <span className="px-2 py-0.5 border border-[#A62027] text-[#A62027] text-[9px] font-black rotate-[-12deg] rounded-sm opacity-60">{card.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : reports[activeReport].phases ? (
                      <div className="space-y-10">
                        <h4 className="text-[#9CAC74] uppercase tracking-widest font-black text-[14px]">Technical Integration:</h4>
                        <div className="grid md:grid-cols-2 gap-8">
                          {reports[activeReport].phases.map((phase, i) => (
                            <div key={i} className="bg-white/5 p-8 rounded-xl border-l-4 border-[#9CAC74]">
                              <strong className="text-[#9CAC74] uppercase text-[12px] tracking-[0.2em] block mb-3">{i+1}. {phase.name}</strong>
                              {phase.desc}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-5xl">
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
        body { background-color: #050505; color: #fdfcf0; margin: 0; padding: 0; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(236, 202, 144, 0.2); border-radius: 10px; }
        @keyframes pulse-subtle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.02); } }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
        #next-dev-indicator, .__next-dev-indicator-container { display: none !important; }
      `}</style>
    </div>
  );
}