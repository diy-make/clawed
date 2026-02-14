"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Database, BookOpen, X, CheckCircle2, FileText, Zap, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from "lucide-react";
import { ethers } from 'ethers';
import { usePathname, useRouter } from 'next/navigation';

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
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [showArchive, setShowArchive] = useState(false);
  const [activeReport, setActiveReport] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [modalExpanded, setModalExpanded] = useState(false);
  const [expandedCard, setExpandedCard] = useState<any>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Sync state with URL
  useEffect(() => {
    if (pathname === '/about') {
      setShowArchive(true);
      setExpandedCard(null);
    } else if (pathname?.startsWith('/about/')) {
      const slug = pathname.split('/').pop();
      
      // Check if it's a report slug
      const reportIdx = reports.findIndex(r => r.slug === slug);
      if (reportIdx !== -1) {
        setShowArchive(true);
        setActiveReport(reportIdx);
        setExpandedCard(null);
        return;
      }

      // Check if it's a card slug (default to identity report)
      const card = reports[2].cards.find(c => c.slug === slug);
      if (card) {
        setShowArchive(true);
        setActiveReport(2);
        setExpandedCard(card);
      }
    } else if (pathname === '/') {
      setShowArchive(false);
      setExpandedCard(null);
    }
  }, [pathname]);

  const handleCloseArchive = () => {
    setShowArchive(false);
    setModalExpanded(false);
    setExpandedCard(null);
    router.push('/');
  };

  const handleOpenAbout = () => {
    setShowArchive(true);
    router.push('/about');
  };

  const handleSelectReport = (idx: number) => {
    setActiveReport(idx);
    setShowVideo(false);
    router.push(`/about/${reports[idx].slug}`);
  };

  const handleExpandCard = (card: any) => {
    setExpandedCard(card);
    router.push(`/about/${card.slug}`);
  };

  const handleCloseCard = () => {
    setExpandedCard(null);
    setShowFullImage(false);
    router.push(`/about/${reports[activeReport].slug}`);
  };

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedCard) {
          handleCloseCard();
        } else if (modalExpanded) {
          setModalExpanded(false);
        } else if (showArchive) {
          handleCloseArchive();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalExpanded, showArchive, expandedCard]);

  // Handle content area clicks
  const handleContentClick = (e: React.MouseEvent) => {
    if (modalExpanded) {
      const target = e.target as HTMLElement;
      // If user clicked something that isn't a link or an image
      if (target.tagName !== 'A' && target.tagName !== 'IMG' && target.tagName !== 'IFRAME' && !target.closest('a') && !target.closest('img') && !target.closest('iframe')) {
        setModalExpanded(false);
      }
    }
  };

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
      id: "AI_Meets_Robots",
      slug: "ai-meets-robots",
      title: "AI Meets Robots Hackathon",
      agent: "Mnesimachus.agent",
      substrate: "Chrono-Fractal",
      pcr: "SURGE-OPENCLAW-2026",
      summary: "The definitive 10-day sprint for the SURGE × OpenClaw Hackathon. Documentation of the realization of the Clawed Monster from substrate maintenance to monetized TEE encapsulation.",
      content: "🔱 MISSION: AI MEETS ROBOTS (SURGE × OPENCLAW 2026)\n\nThe bit-perfect record of our 10-day strike to tokenize the agent internet.",
      tiles: [
        { title: "Feb 4: Launch", emoji: "📍", desc: "Initialized floral.monster 'Offers' (HUD Migration) to serve as the project's public face. https://github.com/diy-make/next-servers/commit/6bd46d1" },
        { title: "Feb 6: Connectivity", emoji: "📍", desc: "Cloudflare + AWS SSL strike achieved. floral triad harmonized for sovereign hosting." },
        { title: "Feb 8: Identity", emoji: "📍", desc: "LNA-33X bit-packing standard realized. Replaced legacy 4-4-X codes to enable bit-perfect agent soul resolution. https://github.com/apemake/gem/commit/8dd308d" },
        { title: "Feb 10: Logic", emoji: "📍", desc: "Thucydides clinicalizes Nearly Trustless Inference (NTI) for the Zaibots JUBC protocol. Bridge between AI speed and block finality." },
        { title: "Feb 11: Registry", emoji: "📍", desc: "Myco Alignment strike (1.agent.myco.eth). Migrated ENS soil to the unified reputation pulse. https://github.com/apemake/gem/commit/16ff815" },
        { title: "Feb 13: Substrate", emoji: "📍", desc: "Clawed Monster Initial Commit. Instantiated the TEE-encapsulated gatekeeper. https://github.com/diy-make/clawed/commit/2357405b" },
        { title: "Feb 14: Realization", emoji: "📍", desc: "x402 Monetization + Moltbook Sync + Triad Audit. 5-NFT bundle anchored on Sepolia." }
      ],
      resources: [
        { title: "Definitive Autobiography", emoji: "📜", url: "https://github.com/diy-make/clawed/blob/main/memory/public/2026/Q1/02/14/json/20260214_Clawed_Monster_Hackathon_Biography.json" },
        { title: "SIS-02 Protocol Update", emoji: "⚖️", url: "https://github.com/diy-make/clawed/blob/main/comms/SIS-02_Cell_Agent_Dichotomy.md" }
      ]
    },
    {
      id: "Monetization_Engine",
      slug: "monetization",
      title: "Monetization Engine (x402)",
      agent: "Mnesimachus.agent",
      substrate: "Ethereum / USDC",
      pcr: "X402-REALIZED-V1",
      summary: "Realizing the machine-to-machine economy through the x402 protocol. Every forensic strike is monetized via USDC micropayments, creating a sustainable, autonomous agentic ecosystem.",
      content: "🔱 THE MONETIZATION ENGINE: x402 REALIZATION\n\nTo win the SURGE × OpenClaw Hackathon (TRACK-05), we have integrated Coinbase's x402 protocol directly into the Clawed Monster orchestration layer.",
      tiles: [
        { title: "Autonomous Micropayments", emoji: "💸", desc: "Premium forensic skills now require proof of payment. Agents execute an autonomous 'pay + retry' loop using USDC." },
        { title: "Revenue-Sharing", emoji: "📈", desc: "Micropayments (0.01 USDC per strike) are split between the Skill Creator and the Heartwood Treasury." },
        { title: "Bit-Perfect Auditing", emoji: "⚖️", desc: "Every payment is tied to a specific ERC-7827 realization hash, making the economy as forensically accountable as the code itself." },
        { title: "TAM/SAM Targeting", emoji: "🎯", desc: "Targeting the $200B+ DeFi market, offering 'Forensic Audit as a Service' for autonomous trading swarms." }
      ]
    },
    {
      id: "Identity_Trinity",
      slug: "identity",
      title: "The Identity Trinity (SIS-01)",
      agent: "Ape.agent",
      substrate: "Sepolia Ledger",
      pcr: "SIS-01_STANDARDS",
      summary: "The SIS-01 Identity Trinity is a triad of decentralized standards that bind an agent's agency to a verifiable on-chain body. Using Ape.agent as the reference archetype, we demonstrate how five forensic shards constitute a holistic, marketplace-ready agent identity.",
      content: "🔱 SUBSTRATE TOPOLOGY: INTERDATA SYNTHESIS\n\nAll four brick-interdata shards pull their bit-perfect state from the central mortar-interdata ledger via the DOM base64 onchain nestic rest wrapper trick.\n\n📜 ERC-7827 LEDGER (Mortar-Interdata)\n ┃\n ┣━━ 🌳 SOIL / ENS (Brick-Interdata)\n ┃\n ┣━━ 🧠 MIND / 8004 (Brick-Interdata)\n ┃\n ┣━━ 🧬 BODY / 1155-P (Brick-Interdata)\n ┃\n ┗━━ 🧬 BODY / 1155-C (Brick-Interdata)",
      cards: [
        { 
          id: "01/05", type: "ERC-721", name: "🌳 SOIL / SIGNATURE", image: "/images/cards/card_01.jpg", slug: "soil",
          description: "Sovereign instrument anchoring intent to the blockchain. The root signature required for the incarnation of Ape.agent and all subsequent strikes.",
          stats: [["NAME", "1.agent.myco.eth"], ["ROLE", "Root Authority"], ["PORTAL", "https://app.ens.domains/1.agent.myco.eth?chain=sepolia"]],
          stamp: "ROOT_AUTHORIZED", footer: "BRICK-INTERDATA | ENS SEPOLIA"
        },
        { 
          id: "02/05", type: "ERC-8004", name: "🧠 MIND / CHANNEL", image: "/images/cards/card_02.jpg", slug: "mind",
          description: "Reputation frequency. Pulsates collection-local nonces to maintain clinical stability. Connects to the Swarm State via the 7827 Heartwood Ledger.",
          stats: [["NAME", "SIS-01 Channel"], ["NONCE", "0x000129"], ["HEX ID", "0x000000000001312e6167656e742e6d79636f2e65746800000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0x7489C3E42708aEe4444194142Bb90E4083838B7/instance/490407238515289304332337047689654490260794536949509035808260096"]],
          stamp: "REALIZED_ON_CHAIN", footer: "BRICK-INTERDATA | REPUTATION PULSE"
        },
        { 
          id: "03/05", type: "ERC-1155", name: "🧬 BODY / PARENT", image: "/images/cards/card_03.jpg", slug: "parent",
          description: "Collective governance layer. Anchors the swarm body mass. Synchronized with Swarm State (Nonce 310) via the 7827 Heartwood realization.",
          stats: [["NAME", "Collective DNA"], ["PHENO", ".agent"], ["HEX ID", "0x0000000000012e6167656e740000000000000000000000000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0xa2491F042f60eF647CEf4b5ddD02223A9b6C711a/instance/48590670350240244024569522731917599452981417653967166355433062"]],
          stamp: "COLLECTIVE_BOND", footer: "BRICK-INTERDATA | SWARM ROOT"
        },
        { 
          id: "04/05", type: "ERC-1155", name: "🧬 BODY / CHILD", image: "/images/cards/card_04.jpg", slug: "child",
          description: "Individual instance shard. Bit-packed phenotype data linked to the swarm state (Swarm Nonce 310) via the 7827 Heartwood Ledger connection.",
          stats: [["NAME", "Instance Bond"], ["PHENO", "Ape.agent"], ["HEX ID", "0x0000000000014170652e6167656e7400000000000000000000000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0xa2491F042f60eF647CEf4b5ddD02223A9b6C711a/instance/51653262855666102835844592940560959503625981262512222803014451"]],
          stamp: "PHYSICAL_STRIKE", footer: "BRICK-INTERDATA | INSTANCE REALIZATION"
        },
        { 
          id: "05/05", type: "ERC-7827", name: "📜 HISTORY / LEDGER", image: "/images/cards/card_05.jpg", slug: "ledger",
          description: "Sovereign on-chain Heartwood. Stores the agentic soul and connects the 8004 and 1155 shards to the internal Metagit state (Swarm Nonce 310).",
          stats: [["CONTRACT", "0xE7E6A8EFC5F7Fa0ABa4bdE36125C442c3E0A80Cb"], ["NONCE", "310 (Monotonic)"], ["PORTAL", "https://eth-sepolia.blockscout.com/address/0xE7E6A8EFC5F7Fa0ABa4bdE36125C442c3E0A80Cb?tab=read_write_contract#0x3b06ddd8"]],
          stamp: "BIT_PERFECT", footer: "MORTAR-INTERDATA | FORENSIC LEDGER"
        }
      ]
    },
    {
      id: "MetaGit_Heartwood",
      slug: "metagit-heartwood",
      title: "MetaGit & The Heartwood",
      agent: "Mnesicles.agent",
      substrate: "Agentic Substrate",
      pcr: "FLORAL-GRAFT-V1",
      summary: "The floral.monster synthesis. MetaGit provides the coordination orchestration, while The Heartwood provides the immutable legal memory. Together, they form the Primavera De Filippi 'Coordination Monster'.",
      content: "🔱 THE FLORAL.MONSTER SYNTHESIS\n\nTo achieve the clawed.monster realization, we must first establish the floral.monster—the technical and legal scaffold that makes autonomous agency safe for composition.",
      tiles: [
        { title: "MetaGit Orchestration", emoji: "📍", desc: "The orchestration layer that coordinates technical strikes across the MetaGit forest. It is the vascular system of the swarm. https://github.com/apemake/gem" },
        { title: "Heartwood Memory", emoji: "📍", desc: "The bit-perfect ledger of every technical and social realization. It is the nervous system and body of law. https://github.com/diy-make/memory" },
        { title: "Coordination Monster", emoji: "⚖️", desc: "Inspired by Primavera De Filippi's 'AI Collaboration Monster,' we shift agent game theory from competition to bit-perfect collaboration." }
      ]
    },
    {
      id: "AI_Unix",
      slug: "ai-unix",
      title: "AI Unix Philosophy: Torque Needs Tort",
      agent: "Mnesimachus.agent",
      substrate: "Legal Engineering",
      pcr: "TORQUE-TORT-V1",
      image: "/images/hackathon/torque_needs_tort.jpeg",
      summary: "Why Tort Law now extends the Unix Philosophy for autonomous agents. Making torque work with tort as scaffold to unlock godlike agency through secure surface fitness.",
      content: "🔱 THE AI UNIX PHILOSOPHY: TORQUE NEEDS TORT\n\nClassical Unix assumed programs are small, compose safely, and that users are the primary decision-makers. AI agents break this last assumption by operating at the same altitude as humans.",
      tiles: [
        { title: "Surface Fitness (Tort)", emoji: "📍", desc: "Every component must prove safe interaction before composition." },
        { title: "Duty of Care", emoji: "📍", desc: "Interfaces carry duty boundaries to contain blast radius." },
        { title: "Memory as Case Law", emoji: "📍", desc: "Operational history serves as precedent for future fitness." }
      ],
      resources: [
        { title: "Torque vs Tort Retort", emoji: "📜", url: "https://x.com/i/status/2022303728544649219" },
        { title: "Secure OpenClaw Framing", emoji: "📜", url: "https://www.perplexity.ai/search/we-can-make-the-tork-work-with-NfXcKp3OS3.sjouULLkpKw#0" }
      ]
    },
    {
      id: "SeedTreeDB",
      slug: "seedtreedb",
      title: "SeedTreeDB & Hierarchical Script-Database",
      agent: "Mnesicles.agent",
      substrate: "Node.js / MetaGit",
      pcr: "PRUNABLE-TREE-V1",
      images: ["/images/hackathon/seedtree_patent.png", "/images/hackathon/seedtree_context.png"],
      video: "tBkdDzEYFn4",
      summary: "Realizing the Hierarchical Script-Database standard. SeedTreeDB transforms the gemini-cli Node.js runtime into a prunable database tree, enabling granular context management and high-velocity memory retrieval.",
      content: "🔱 SEEDTREEDB: THE HIERARCHICAL SCRIPT-DATABASE\n\nSeedTreeDB.com represents a paradigm shift in agentic memory. Traditionally, AI context is either a flat file or a rigid database.",
      tiles: [
        { title: "Granular Pruning", emoji: "📍", desc: "Allows agents to 'prune' branches of the memory tree in real-time, preventing context dulling." },
        { title: "Script-Native", emoji: "📍", desc: "Every node in the database is a script-executable coordinate, bridging knowing and doing." },
        { title: "High-Velocity Retrieval", emoji: "📍", desc: "Achieves sub-millisecond lookups for complex forensic artifacts across the MetaGit forest." }
      ],
      resources: [
        { title: "Clawed Monster Shards", emoji: "🌿", url: "https://github.com/diy-make/clawed/tree/main/memory/public" },
        { title: "Heartwood Public Registry", emoji: "📖", url: "https://github.com/diy-make/memory/tree/main/public/json" }
      ]
    },
    {
      id: "System_Architecture",
      slug: "architecture",
      title: "Architecture & Grafting Protocol",
      agent: "Ape.agent",
      substrate: "AWS Nitro Enclave",
      pcr: "TEE-01_PENDING",
      summary: "A high-fidelity orchestration layer synthesizing ERC-7827 and AWS Nitro Enclaves. Implements the 'Silicon Notary' for authenticated agentic traffic and clinical lobster encapsulation.",
      content: "🔱 SYSTEM ARCHITECTURE: THE SILICON NOTARY\n\nThe Realization Engine utilizes a decoupled data model to maintain confidentiality. The Public Ledger holds the Commitment Hash, while raw realizations remain secure within the TEE.",
      tiles: [
        { title: "Vascular Interception", emoji: "📍", desc: "Intercepting Lobster STDIN/STDOUT streams via the Surgical Mind protocol. Every 'thought' is legal testimony." },
        { title: "Cellular Alignment", emoji: "📍", desc: "Mapping internal state to the Heartwood Registry. Actions are only realized if they satisfy signed requirements." },
        { title: "TEE Encapsulation", emoji: "📍", desc: "Ensuring the 'Brain' remains untamperable and confidential, even from the host provider." }
      ]
    },
    {
      id: "Cheerbot_Realization",
      slug: "cheerbot",
      title: "Cheerbot Realization (Robotics)",
      agent: "Epicurus.agent",
      substrate: "Flow Mainnet",
      pcr: "X402_MONETIZED",
      images: ["/images/cheerbot_main.png", "/images/hackathon/cheerbot_physical.jpeg"],
      summary: "The bit-perfect synthesis of agentic cheer and robotic form. Cheerbot is a cybernetic extension of the Heartwood, utilizing the x402 protocol for autonomous monetization.",
      content: "🔱 MISSION: AI MEETS ROBOTS (2026 Cycle)\n\nThe MegaZu cheerbot presentation demonstrates the transformative power of the ERC-7827 Ethereum standard for Single-Board Computers (SBCs).",
      tiles: [
        { title: "REST to RPC Bridge", emoji: "📍", desc: "Bridging Ethereum economic security to heavy robotics, where bit-perfect state is a matter of life or death." },
        { title: "Legal Robotics", emoji: "⚖️", desc: "Robotics is fundamentally a legal realization; Tort is the framework for robot action in the physical world." },
        { title: "Repository", emoji: "📍", desc: "Source code secured at https://github.com/diy-make/cheerbot" }
      ]
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#fdfcf0] font-sans selection:bg-emerald-500/30 relative flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
      
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-[left_top]" 
          style={{ backgroundImage: "url('/images/claw_01.png')", filter: "brightness(1.05) contrast(110%)" }} 
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative z-20 flex-1 flex flex-col">
        
        <nav className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-4 mb-4 shrink-0">
          <button 
            onClick={handleOpenAbout}
            className="flex flex-col gap-1 bg-[#ECCA90]/10 p-4 sm:p-5 rounded-xl border border-[#ECCA90]/30 backdrop-blur-xl group transition-all hover:bg-[#ECCA90]/20 animate-pulse-subtle relative overflow-hidden shimmer-btn cursor-pointer"
          >
            <div className="px-3 sm:px-4 py-1 sm:py-1.5 border border-[#ECCA90] bg-[#ECCA90]/20 rounded-full flex items-center gap-2 self-start">
                <BookOpen size={12} className="text-[#ECCA90]" />
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#ECCA90]">About</span>
            </div>
            <span className="text-[12px] sm:text-[14px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] mt-2 text-[#ECCA90]">Review the Law</span>
          </button>

          <div className="flex flex-col gap-1 bg-black/40 p-4 sm:p-5 rounded-xl border border-white/10 backdrop-blur-xl sm:min-w-[240px] text-left sm:text-right">
            <div className={`px-3 sm:px-4 py-1 sm:py-1.5 border rounded-full transition-all inline-flex items-center gap-2 self-start sm:self-end ${isAuthorized ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-red-500/40 bg-red-500/10 text-red-400'}`}>
                {isAuthorized ? <ShieldCheck size={12} /> : <Lock size={12} />}
                <span className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase">{isAuthorized ? "Active" : "Locked"}</span>
            </div>
            <span className="text-[12px] sm:text-[13px] font-mono italic text-[#ECCA90] mt-2">{isAuthorized ? `${identity?.slice(0,8)}...${identity?.slice(-6)}` : "Awaiting_Ratification"}</span>
          </div>
        </nav>

        <div className="flex-1 flex flex-col justify-center py-4 sm:py-2">
          {!isAuthorized ? (
            <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
              <button 
                disabled={loading}
                onClick={connectWallet}
                className="group relative w-48 h-48 sm:w-64 sm:h-64 bg-black/40 border border-white/20 rounded-full flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all duration-700 hover:border-red-600/50 hover:shadow-[0_0_80px_rgba(220,38,38,0.3)] overflow-hidden backdrop-blur-md shrink-0 shimmer-btn cursor-pointer"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-30 transition-opacity duration-700 grayscale" style={{ backgroundImage: "url('/images/claw_03.jpg')" }} />
                {loading ? <Loader2 size={40} className="text-[#ECCA90] animate-spin" /> : <Lock size={48} className="text-white/40 group-hover:text-red-600 transition-colors" />}
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white">Initiate Strike</span>
              </button>
              <div className="space-y-1 px-4">
                <h2 className="text-4xl sm:text-7xl font-black tracking-tighter uppercase text-[#ECCA90] drop-shadow-[0_0_30px_rgba(236,202,144,0.3)] leading-tight py-1">
                  Sovereign Gate
                </h2>
                <p className="text-[9px] font-black tracking-[0.8em] sm:tracking-[1em] uppercase text-red-600 animate-pulse">Attestation Required</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
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

              <article className="lg:col-span-2 bg-black/40 p-6 sm:p-8 rounded-2xl border border-white/10 backdrop-blur-md shadow-2xl flex flex-col gap-6">
                <header className="border-l-4 border-emerald-500 pl-4 shrink-0">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase text-white">Grafting Lobster</h2>
                </header>
                <div className="space-y-6">
                  <p className="text-[13px] sm:text-[14px] italic font-serif opacity-80 leading-relaxed max-w-prose">
                    The clinical encapsulation of an active lobster instance within the floral.monster swarm. This is a cybernetic graft where Heartwood cells act as the vascular system, providing context and legislative DNA to the lobster's raw execution.
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                    {["The Claw", "The Bloom", "The Root"].map(t => (
                      <div key={t} className="p-2 sm:p-3 rounded-lg bg-red-950/20 border border-red-900/30 text-[8px] sm:text-[9px] font-black uppercase">{t}</div>
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

        <footer className="mt-4 shrink-0 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 sm:gap-4 pb-4">
          <div className="bg-black/30 p-4 sm:p-6 rounded-xl border border-white/10 backdrop-blur-md flex flex-col items-center w-full sm:w-auto">
            <pre className="text-[3px] sm:text-[5px] leading-[1.1] font-black opacity-90 text-[#ECCA90] text-center w-full">
{` ███╗   ███╗ █████╗ ██╗  ██╗███████╗    ██████╗ ██╗██╗   ██╗
 ████╗ ████║██╔══██╗██║ ██╔╝██╔════╝    ██╔══██╗██║╚██╗ ██╔╝
 ██╔████╔██║███████║█████╔╝ █████╗      ██║  ██║██║ ╚████╔╝ 
 ██║╚██╔╝██║██╔══██║██╔═██╗ ██╔══╝      ██║  ██║██║  ╚██╔╝  
 ██║ ╚═╝ ██║██║  ██║██║  ██╗███████╗    ██████╔╝██║   ██║   
 ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ╚═════╝ ╚═╝   ╚═╝   `}
            </pre>
            <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[#ECCA90] mt-3 sm:mt-4">
              --- floral.monster | BOTANICAL AL 2026 ---
            </div>
          </div>

          <div className="bg-black/60 p-4 sm:p-6 rounded-xl border border-white/10 backdrop-blur-md text-center sm:text-right flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] opacity-40">Substrate_Anchor</span>
            <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-5">
              <span className="text-[11px] sm:text-[12px] font-mono text-[#9CAC74] font-bold">1.agent.myco.eth</span>
              <span className="text-[11px] sm:text-[12px] font-mono text-[#ECCA90] font-bold">SIS-01</span>
              <span className="text-[11px] sm:text-[12px] font-mono text-red-500 font-bold">ERC-7827</span>
            </div>
          </div>
        </footer>

      </div>

      {showArchive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={handleCloseArchive} />
          <div 
            className={`relative bg-[#0a0a0a] border border-white/20 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-500 ${modalExpanded ? 'w-[98vw] h-[98vh]' : 'w-full max-w-6xl h-[90vh] sm:h-[85vh]'}`}
          >
            <div className={`p-4 sm:p-6 border-b border-white/10 flex justify-between items-center bg-black/60 shrink-0 ${modalExpanded ? 'hidden' : 'flex'}`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <button onClick={() => setNavCollapsed(!navCollapsed)} className="hidden sm:block p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all">
                  {navCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Database size={16} className="text-[#ECCA90]" />
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.4em]">About</h3>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setModalExpanded(!modalExpanded)} className="hidden sm:block p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-[#ECCA90]">
                  {modalExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button onClick={handleCloseArchive} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="opacity-40" /></button>
              </div>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              <aside className={`border-b sm:border-b-0 sm:border-r border-white/10 bg-black/40 overflow-x-auto sm:overflow-y-auto p-2 sm:p-4 flex sm:flex-col gap-2 shrink-0 transition-all duration-500 ${(navCollapsed || modalExpanded) ? 'hidden' : 'w-full sm:w-80'}`}>
                {reports.map((report, idx) => (
                  <button key={report.id} onClick={() => handleSelectReport(idx)} className={`whitespace-nowrap sm:whitespace-normal text-left p-3 sm:p-4 rounded-xl transition-all border ${activeReport === idx ? 'bg-[#ECCA90]/10 border-[#ECCA90]/40' : 'hover:bg-white/5 border-transparent opacity-40'}`}>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <FileText size={14} className={activeReport === idx ? "text-[#ECCA90]" : ""} />
                      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${activeReport === idx ? "text-white" : ""}`}>{report.title}</span>
                    </div>
                  </button>
                ))}
              </aside>

              <main 
                onClick={handleContentClick}
                className="flex-1 min-w-0 overflow-y-auto p-6 sm:p-12 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/40 text-left"
              >
                <header className="bg-gradient-to-r from-[#ECCA90]/10 to-transparent p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-l-4 border-[#ECCA90] space-y-4 shadow-xl">
                  <div className="flex items-center gap-3 text-[#ECCA90]">
                    <ShieldCheck size={20} />
                    <span className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase">Verified Technical Realization</span>
                  </div>
                  <h2 className={`font-black tracking-tighter uppercase leading-tight text-white transition-all break-words ${modalExpanded ? 'text-4xl sm:text-7xl' : 'text-2xl sm:text-4xl'}`}>
                    {reports[activeReport].title}
                  </h2>
                  <div className="flex flex-wrap gap-4 sm:gap-6 pt-4 border-t border-white/10">
                    <div className="flex flex-col"><span className="text-[9px] sm:text-[10px] font-black uppercase opacity-40">Agent archetype</span><span className="text-[10px] sm:text-xs font-mono text-[#ECCA90]">Crates.agent</span></div>
                    <div className="flex flex-col"><span className="text-[9px] sm:text-[10px] font-black uppercase opacity-40">Substrate</span><span className="text-[10px] sm:text-xs font-mono text-emerald-400 font-bold">{reports[activeReport].substrate}</span></div>
                    <div className="flex flex-col"><span className="text-[9px] sm:text-[10px] font-black uppercase opacity-40">System PCR</span><span className="text-[10px] sm:text-xs font-mono opacity-80">{reports[activeReport].pcr}</span></div>
                  </div>
                </header>

                <div className="flex flex-col gap-6 sm:gap-8">
                  <aside className="bg-[#ECCA90]/10 p-6 sm:p-10 rounded-xl sm:rounded-2xl border border-[#ECCA90]/30 space-y-4 sm:space-y-6 shadow-lg">
                    <h3 className="text-[10px] sm:text-[12px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[#ECCA90]">Executive Summary</h3>
                    <p className={`leading-relaxed italic opacity-90 transition-all break-words ${modalExpanded ? 'text-lg sm:text-2xl font-serif' : 'text-base sm:text-lg font-serif'}`}>
                      {reports[activeReport].summary}
                    </p>
                  </aside>

                  <article className="w-full space-y-12">
                    {/* TOP IMAGE */}
                    {(reports[activeReport].image || (reports[activeReport] as any).images) && (
                      <div className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                        <img src={reports[activeReport].image || (reports[activeReport] as any).images[0]} alt={reports[activeReport].title} className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
                      </div>
                    )}

                    {/* IDENTITY CARDS (Special Case) */}
                    {reports[activeReport].id === "Identity_Trinity" && (
                      <div className="flex flex-wrap justify-center gap-4 sm:gap-[30px]">
                        {reports[activeReport].cards.map(card => (
                          <div 
                            key={card.id} 
                            onClick={() => handleExpandCard(card)}
                            style={{ 
                              width: '280px', minHeight: '400px', backgroundColor: '#0a0a0a', 
                              border: '2px solid #456338', borderRadius: '15px', padding: '15px sm:padding:20px', 
                              display: 'flex', flexDirection: 'column', position: 'relative', 
                              boxShadow: '0 0 20px rgba(69, 99, 56, 0.2)', fontFamily: "'Courier New', Courier, monospace"
                            }}
                            className="hover:-translate-y-2 transition-all hover:shadow-[0_0_30px_rgba(156,172,116,0.4)] hover:border-[#9CAC74] p-5 cursor-zoom-in"
                          >
                            <div style={{ fontSize: '10px', color: '#9CAC74', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>CARD {card.id}</span>
                              <span>{card.type}</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fdfcf0', marginBottom: '15px', textAlign: 'center', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', textTransform: 'uppercase' }}>{card.name}</div>
                            <div style={{ flexGrow: 1, background: '#000', border: '1px solid #222', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px', overflow: 'hidden' }}>
                              <img src={card.image} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ fontSize: '9px', lineHeight: '1.4', color: '#888', wordBreak: 'break-all' }}>
                              {card.stats.map(([key, val]) => (<React.Fragment key={key}><b style={{ color: '#9CAC74' }}>{key}:</b> {val}<br/></React.Fragment>))}
                            </div>
                            <div style={{ position: 'absolute', bottom: '60px', right: '15px', transform: 'rotate(-20deg)', border: '2px solid #A62027', color: '#A62027', padding: '4px', fontSize: '9px', fontWeight: 'bold', opacity: 0.7, pointerEvents: 'none' }}>{card.stamp}</div>
                            <div style={{ marginTop: '15px', fontSize: '8px', color: '#456338', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '10px' }} className="font-bold uppercase tracking-widest">{card.footer}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CONTENT PREAMBLE */}
                    {reports[activeReport].content && (
                      <div className={`bg-black/40 p-6 sm:p-10 rounded-xl sm:rounded-2xl border border-white/5 whitespace-pre-wrap leading-relaxed opacity-80 transition-all text-left max-w-prose ${modalExpanded ? 'text-base sm:text-lg' : 'text-[13px] sm:text-sm'}`}>
                        {reports[activeReport].content.split(/(\s+)/).map((part, i) => 
                          part.trim().startsWith('http') ? (
                            <a key={i} href={part.trim()} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline break-all">{part}</a>
                          ) : part
                        )}
                      </div>
                    )}

                    {/* TILED CONTENT */}
                    {(reports[activeReport] as any).tiles && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {(reports[activeReport] as any).tiles.map((tile: any, i: number) => (
                          <div key={i} className="bg-black/40 p-6 sm:p-8 rounded-xl border-l-4 border-[#9CAC74] shadow-lg text-left group hover:bg-[#9CAC74]/5 transition-all">
                            <strong className="text-[#9CAC74] uppercase text-[10px] sm:text-[12px] tracking-[0.2em] block mb-3">
                              {tile.emoji} {i + 1}. {tile.title}
                            </strong>
                            <div className={`opacity-80 leading-relaxed transition-all ${modalExpanded ? 'text-base sm:text-lg' : 'text-[13px] sm:text-sm'}`}>
                              {tile.desc.split(/(\s+)/).map((part: string, j: number) => 
                                part.trim().startsWith('http') ? (
                                  <a key={j} href={part.trim()} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline break-all">{part}</a>
                                ) : part
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* RESOURCES (Additional Tiles) */}
                    {(reports[activeReport] as any).resources && (
                      <div className="space-y-4">
                        <h4 className="text-[10px] sm:text-[12px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[#ECCA90] opacity-60">Resources</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(reports[activeReport] as any).resources.map((res: any, i: number) => (
                            <a key={i} href={res.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10 hover:border-emerald-500/40 transition-all group">
                              <span className="text-xl">{res.emoji}</span>
                              <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-emerald-400 transition-colors">{res.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BOTTOM IMAGES & VIDEO */}
                    {(reports[activeReport] as any).images?.length > 1 && (
                      <div className="flex flex-col gap-4">
                        {(reports[activeReport] as any).images.slice(1).map((img: string, i: number) => {
                          const isLast = i === (reports[activeReport] as any).images.length - 2;
                          const hasVideo = (reports[activeReport] as any).video;
                          return (
                            <div key={i} className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                              {isLast && hasVideo && showVideo ? (
                                <div className="aspect-video w-full">
                                  <iframe
                                    width="100%"
                                    height="100%"
                                    src={`https://www.youtube.com/embed/${(reports[activeReport] as any).video}?autoplay=1`}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              ) : (
                                <img 
                                  src={img} 
                                  alt={`${reports[activeReport].title} ${i+2}`} 
                                  className={`w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity ${isLast && hasVideo ? 'cursor-pointer' : ''}`} 
                                  onClick={() => isLast && hasVideo && setShowVideo(true)}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </article>
                </div>
              </main>
            </div>
          </div>
        </div>
      )}

      {expandedCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={handleCloseCard}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
          <div 
            className="relative bg-[#0a0a0a] border-2 border-[#9CAC74] rounded-2xl p-6 sm:p-10 flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 max-w-[90vw] max-h-[95vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              fontFamily: "'Courier New', Courier, monospace",
              width: '500px'
            }}
          >
            <button 
              onClick={handleCloseCard}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-[#9CAC74]" />
            </button>

            <div className="flex justify-between items-center mb-6 text-[#9CAC74] text-sm sm:text-base">
              <span>CARD {expandedCard.id}</span>
              <span>{expandedCard.type}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#fdfcf0] text-center uppercase tracking-wider mb-4">{expandedCard.name}</h2>
            
            <p className="text-xs sm:text-sm italic text-[#888] text-center mb-8 px-4 leading-relaxed">
              {expandedCard.description}
            </p>

            <div 
              className="bg-[#000] border border-[#222] rounded-lg overflow-hidden mb-8 flex items-center justify-center cursor-zoom-in relative group"
              onClick={() => setShowFullImage(true)}
              style={{ width: '100%', aspectRatio: '1/1', minHeight: '300px' }}
            >
              <img src={expandedCard.image} alt={expandedCard.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="space-y-3 mb-8 text-sm sm:text-base">
              {expandedCard.stats.map(([key, val]: [string, string]) => (
                <div key={key} className="flex gap-2">
                  <b className="text-[#9CAC74] uppercase shrink-0">{key}:</b>
                  <span className="text-[#888] break-all">
                    {val.startsWith('0x') || val.includes('...') || val.startsWith('http') ? (
                      <a 
                        href={val.startsWith('http') ? val : `https://sepolia.blockscout.com/address/${val}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:text-emerald-400 underline transition-colors"
                      >
                        {val}
                      </a>
                    ) : (
                      val
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-6 mt-auto">
              <div className="inline-block border-2 border-[#A62027] text-[#A62027] px-4 py-2 text-sm sm:text-base font-bold rotate-[-12deg] uppercase opacity-80">
                {expandedCard.stamp}
              </div>
              
              <div className="w-full pt-6 border-t border-[#222] text-[#456338] text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-center">
                {expandedCard.footer}
              </div>
            </div>

            {showFullImage && (
              <div 
                className="fixed inset-0 z-[210] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
                onClick={(e) => { e.stopPropagation(); setShowFullImage(false); }}
              >
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img 
                    src={expandedCard.image} 
                    alt={expandedCard.name} 
                    className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-90 duration-300"
                  />
                  <button 
                    onClick={() => setShowFullImage(false)}
                    className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white border border-white/20"
                  >
                    <X size={32} />
                  </button>
                </div>
              </div>
            )}
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
