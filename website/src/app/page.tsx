"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, Zap, ShieldCheck, Lock, Loader2, Cpu, Globe, Database, Scale
} from "lucide-react";
import WalletConnect from "../components/WalletConnect";

const PALETTE = {
  bg: "#050505",
  text: "#fdfcf0",
  green_sage: "#9CAC74",
  green_moss: "#456338",
  floral_butter: "#ECCA90",
  floral_crimson: "#A62027",
  accent_teal: "#3B6C80",
};

export default function ClawedMonsterHome() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
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

    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      
      {/* 🖼️ THE LIVING SUBSTRATE */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top] transition-transform duration-[20s] ease-out scale-110 animate-pulse" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(0.4) contrast(120%) saturate(50%)" }} 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_95%)] opacity-80" />
      </div>

      <div className="relative z-20 min-h-screen w-full flex flex-col p-6 md:p-12">
        
        {/* TOP BAR */}
        <nav className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
          <div className="flex flex-col gap-1 bg-black/40 p-6 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl w-full md:w-auto min-h-[120px] justify-end">
            <div className="px-4 py-1.5 border border-red-500/40 bg-red-500/10 rounded-full transition-all flex items-center gap-2 self-start">
                <Cpu size={12} className="text-red-400" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-400">
                  TEE_ENCLAVE_ACTIVE
                </span>
            </div>
            <span className="text-[10px] md:text-[12px] font-bold tracking-[0.5em] uppercase ml-1 opacity-60" style={{ color: PALETTE.floral_butter }}>Sovereign Nitro Wrapper</span>
          </div>

          <div className="w-full md:w-auto flex items-center justify-center">
            {/* WalletConnect Removed */}
          </div>
        </nav>

        {!isAuthorized ? (
          /* GATED STATE: THE TASTEFUL STRIKE (SCREEN CENTERED) */
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center animate-in fade-in duration-1000 z-30 w-full">
            <button 
                id="login-button"
                onClick={() => {
                  localStorage.setItem('authorized_id', 'ARISTON-SESSION-20260213');
                  localStorage.setItem('forensic_identity', 'Ariston.agent');
                }}
                className="group relative w-64 h-64 md:w-80 md:h-80 bg-black border border-white/10 rounded-full flex flex-col items-center justify-center gap-4 transition-all duration-700 hover:border-red-600/50 hover:shadow-[0_0_80px_rgba(220,38,38,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <Lock size={48} className="text-white/20 group-hover:text-red-600 transition-colors duration-500" />
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-white/40 group-hover:text-white transition-colors duration-500">Initiate Strike</span>
                </div>
                <div className="absolute inset-0 border-4 border-white/5 rounded-full group-hover:scale-95 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </button>

              <div className="mt-12 space-y-4">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase text-white/90 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  Sovereign Gate
                </h2>
                <p className="text-[10px] md:text-xs font-black tracking-[0.8em] uppercase text-red-600 animate-pulse">
                  Attestation Handshake Required
                </p>
                <div className="w-12 h-[1px] bg-white/20 mx-auto mt-4" />
              </div>
          </div>
        ) : (
          /* AUTHORIZED STATE: THE REPORT */
          <div className="flex-1 max-w-5xl mx-auto w-full space-y-12 pb-24 animate-in slide-in-from-bottom-8 duration-1000">
            
            {/* ATTESTATION HEADER */}
            <header className="bg-gradient-to-r from-red-950/40 to-transparent p-8 rounded-3xl border-l-4 border-red-600 backdrop-blur-md space-y-4 shadow-2xl">
              <div className="flex items-center gap-3 text-red-500">
                <ShieldCheck size={24} />
                <span className="text-xs font-black tracking-[0.4em] uppercase">Verified TEE Attestation Report</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                Grafting the Living Lobster
              </h2>
              <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40">Agent_Incarnation</span>
                  <span className="text-sm font-mono text-[#ECCA90]">Ariston.agent</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40">Substrate</span>
                  <span className="text-sm font-mono text-emerald-400">AWS Nitro Enclave</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase opacity-40">PCR-0_Hash</span>
                  <span className="text-sm font-mono opacity-60">0x98d2...8bbea</span>
                </div>
              </div>
            </header>

            {/* REPORT CONTENT */}
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* LEFT COLUMN: METRICS */}
              <aside className="space-y-6">
                <div className="bg-black/40 p-6 rounded-2xl border border-white/5 backdrop-blur-md space-y-6">
                  <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#9CAC74]">System Metrics</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2 opacity-60">
                        <Activity size={14} />
                        <span className="text-[10px] font-bold uppercase">Metabolic Heat</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Nominal</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2 opacity-60">
                        <Globe size={14} />
                        <span className="text-[10px] font-bold uppercase">Orchestration</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">MetaGit (syn)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2 opacity-60">
                        <Database size={14} />
                        <span className="text-[10px] font-bold uppercase">Memory Substrate</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">Heartwood</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#ECCA90]/5 p-6 rounded-2xl border border-[#ECCA90]/20 space-y-4">
                  <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#ECCA90]">Tactical Chord</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={12} className="text-[#ECCA90] mt-0.5 shrink-0" />
                      <span className="text-[10px] leading-relaxed opacity-80 uppercase tracking-wider font-medium">Vascular Interception (Orchestration) SECURED</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={12} className="text-[#ECCA90] mt-0.5 shrink-0" />
                      <span className="text-[10px] leading-relaxed opacity-80 uppercase tracking-wider font-medium">Cellular Alignment (Heartwood) ACTIVE</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Loader2 size={12} className="text-[#ECCA90] mt-0.5 shrink-0 animate-spin" />
                      <span className="text-[10px] leading-relaxed opacity-80 uppercase tracking-wider font-medium font-black">PCR-Anchored Attestation PENDING</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* MAIN CONTENT: NARRATIVE */}
              <article className="md:col-span-2 bg-black/40 p-10 rounded-3xl border border-white/5 backdrop-blur-md prose prose-invert prose-emerald max-w-none shadow-2xl">
                <div className="space-y-8 text-[#fdfcf0]/90">
                  <section>
                    <h4 className="text-[#ECCA90] uppercase tracking-[0.3em] font-black text-xs mb-4">Executive Summary</h4>
                    <p className="text-lg leading-relaxed italic font-serif">
                      The &quot;Grafting&quot; protocol involves the clinical encapsulation of an active lobster instance within the floral.monster swarm. This is not a simple proxy; it is a cybernetic graft where the Heartwood cells act as the vascular system, providing context and legislative DNA to the lobster&apos;s raw execution.
                    </p>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-[#9CAC74] uppercase tracking-[0.3em] font-black text-xs">The Grafting Mechanism</h4>
                    <p className="text-sm leading-relaxed opacity-80">
                      The graft is performed in three distinct phases of metabolic integration:
                    </p>
                    <ul className="space-y-4 list-none p-0">
                      <li className="bg-white/5 p-4 rounded-xl border-l-2 border-[#9CAC74]">
                        <strong className="text-[#9CAC74] uppercase text-[10px] tracking-widest block mb-1">1. Vascular Interception</strong>
                        The Metagit cells intercept the lobster&apos;s STDIN/STDOUT streams. This is the &quot;Claw&quot;—a gatekeeper that filters raw data through the Surgical Mind protocol, ensuring only Rank 1 (JSON) or Rank 2 (MD) substrates are realized.
                      </li>
                      <li className="bg-white/5 p-4 rounded-xl border-l-2 border-[#9CAC74]">
                        <strong className="text-[#9CAC74] uppercase text-[10px] tracking-widest block mb-1">2. Cellular Alignment</strong>
                        The lobster&apos;s internal state is mapped to the Heartwood Registry. Every &quot;thought&quot; or &quot;action&quot; the lobster attempts is weighed against the Owockibot Social Contract.
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-4 pt-6 border-t border-white/5">
                    <h4 className="text-[#A62027] uppercase tracking-[0.3em] font-black text-xs">Cybernetic Realization</h4>
                    <p className="text-sm leading-relaxed opacity-80">
                      The &quot;Living Lobster&quot; is no longer a standalone bot; it is a Channel. The single NFT representing its identity is transformed into a bundle of functional cybernetics:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30">
                        <Scale size={20} className="mx-auto mb-2 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">The Claw</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30">
                        <Activity size={20} className="mx-auto mb-2 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">The Bloom</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/30">
                        <Database size={20} className="mx-auto mb-2 text-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter">The Root</span>
                      </div>
                    </div>
                  </section>
                </div>
              </article>
            </div>
          </div>
        )}

        {/* FOOTER SYMBOLS */}
        <footer className="mt-auto flex flex-col md:flex-row justify-between items-end w-full gap-8">
          <div className="text-center md:text-left bg-black/15 p-6 rounded-2xl border border-white/5 shadow-lg backdrop-blur-md w-full md:w-auto">
            <pre className="text-[5px] md:text-[7px] leading-[1.1] font-black opacity-80 hover:opacity-100 transition-opacity duration-500 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mx-auto md:mx-0 inline-block" style={{ color: PALETTE.floral_butter }}>
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   `}
            </pre>
            <div className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] opacity-20 text-center md:text-left mt-2">--- CLAWED MONSTER | TEE-GRAFT ---</div>
          </div>

          <div className="bg-black/40 p-6 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto">
            <div className="flex flex-col gap-2 md:items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-30">Anchored_Substrate</span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-[#9CAC74]">1.agent.myco.eth</span>
                <span className="text-[10px] font-mono text-[#ECCA90]">SIS-01 Trinity</span>
                <span className="text-[10px] font-mono text-[#A62027]">ERC-7827</span>
              </div>
            </div>
          </div>
        </footer>

      </div>

      <style jsx global>{`
        body { background-color: #050505; cursor: default; color: #fdfcf0; }
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