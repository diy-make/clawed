"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Shield, Cpu, Activity } from "lucide-react";

const PALETTE = {
  bg: "#050505",
  text: "#fdfcf0",
  green_sage: "#9CAC74",
  green_moss: "#456338",
  floral_butter: "#ECCA90",
  accent_teal: "#3B6C80",
};

interface LogLine {
  type: "system" | "prompt" | "response";
  content: string;
  command?: string;
}

export default function SovereignEngineHUD() {
  const [logs, setLogs] = useState<LogLine[]>([
    { type: "system", content: "Initializing substrate (Triad-Nonce LNA-33X)... OK" },
    { type: "system", content: "Mapping Heartwood DNA (SHA256: d2464228...)... OK" },
    { type: "system", content: "Anchoring identity: Hyperion (Male)... OK" },
    { type: "system", content: "Clickwrap Handshake: RATIFIED... OK" },
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const terminalRef = useRef<HTMLDivElement>(null);

  const commands = [
    { cmd: "ls repos/diy-make/memory/public/json", res: "configuration/ favorites/ github/ knowledge_data/ logic/ trunk/ wedo/ index.json wishlist.json" },
    { cmd: "status --substrate", res: "Substrate: STABLE | Identity: Hyperion | Mission: SBE-07" },
    { cmd: "cat /proc/intent", res: "Intent: Establish User-Bound Sovereignty via x402 Clickwrap." },
  ];

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let cmdIdx = 0;

    const typeNextCommand = () => {
      if (cmdIdx >= commands.length) return;
      
      const targetCmd = commands[cmdIdx].cmd;
      let charIdx = 0;
      
      const typeChar = () => {
        if (charIdx < targetCmd.length) {
          setCurrentCommand(targetCmd.substring(0, charIdx + 1));
          charIdx++;
          timeout = setTimeout(typeChar, 50 + Math.random() * 50);
        } else {
          timeout = setTimeout(executeCmd, 800);
        }
      };

      const executeCmd = () => {
        setLogs(prev => [
          ...prev, 
          { type: "prompt", content: "", command: targetCmd },
          { type: "response", content: commands[cmdIdx].res }
        ]);
        setCurrentCommand("");
        cmdIdx++;
        timeout = setTimeout(typeNextCommand, 1200);
      };

      timeout = setTimeout(typeChar, 2000);
    };

    typeNextCommand();
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="h-screen w-screen bg-[#050505] text-[#fdfcf0] font-mono p-8 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="border-b border-[#456338] pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-[#9CAC74]">
            🔱 SOVEREIGN ENGINE | FLORAL MONSTER
          </h1>
          <p className="text-[10px] opacity-60 tracking-[0.4em] uppercase mt-1">
            WeDo Human-Sovereign Reasoning Channel
          </p>
        </div>
        <div className="text-right text-[10px] space-y-1">
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[#9CAC74]">IDENTITY:</span>
            <span>Hyperion</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <span className="text-[#9CAC74]">SUBSTRATE:</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <Activity className="w-3 h-3" /> ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* TERMINAL */}
      <div 
        ref={terminalRef}
        className="flex-1 bg-white/[0.02] border border-white/[0.05] p-6 overflow-y-auto shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] rounded-lg"
      >
        {logs.map((log, i) => (
          <div key={i} className="mb-2 leading-relaxed text-sm">
            {log.type === "system" && (
              <span className="text-[#9CAC74]">{log.content}</span>
            )}
            {log.type === "prompt" && (
              <div className="flex gap-3">
                <span className="text-[#ECCA90]">{">"}</span>
                <span>{log.command}</span>
              </div>
            )}
            {log.type === "response" && (
              <div className="pl-6 text-stone-400 whitespace-pre-wrap">
                {log.content}
              </div>
            )}
          </div>
        ))}
        
        <div className="flex gap-3 text-sm">
          <span className="text-[#ECCA90]">{">"}</span>
          <span>{currentCommand}</span>
          <span className="w-2 h-5 bg-[#fdfcf0] animate-pulse" />
        </div>
      </div>

      {/* FOOTER / ASCII */}
      <footer className="mt-6 flex justify-between items-end opacity-40 hover:opacity-100 transition-opacity">
        <pre className="text-[6px] leading-[1.1] text-[#ECCA90]">
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   
             --- FLORAL MONSTER | 2026 ---`}
        </pre>
        <div className="flex gap-6">
          <Shield className="w-8 h-8 text-[#9CAC74] opacity-20" />
          <Cpu className="w-8 h-8 text-[#ECCA90] opacity-20" />
        </div>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #456338; border-radius: 10px; }
      `}</style>
    </div>
  );
}
