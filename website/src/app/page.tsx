"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, ShieldCheck, Lock, Loader2, Database, BookOpen, X, CheckCircle2, FileText, Zap, ChevronLeft, ChevronRight, Maximize2, Minimize2, Plus, Minus, ArrowRight, ExternalLink
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
  const [selectedTile, setSelectedTile] = useState<any>(null);

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
    setSelectedTile(null);
    router.push('/');
  };

  const handleOpenAbout = () => {
    setShowArchive(true);
    router.push('/about');
  };

  const handleSelectReport = (idx: number) => {
    setActiveReport(idx);
    setShowVideo(false);
    setSelectedTile(null);
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

  const handleOpenTile = (tile: any) => {
    setSelectedTile(tile);
  };

  const handleCloseTile = () => {
    setSelectedTile(null);
  };

  // Esc key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedTile) {
          handleCloseTile();
        } else if (expandedCard) {
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
  }, [modalExpanded, showArchive, expandedCard, selectedTile]);

  // Handle content area clicks
  const handleContentClick = (e: React.MouseEvent) => {
    if (modalExpanded) {
      const target = e.target as HTMLElement;
      // If user clicked something that isn't a link or an image or a tile button
      if (
        target.tagName !== 'A' && 
        target.tagName !== 'IMG' && 
        target.tagName !== 'IFRAME' && 
        target.tagName !== 'BUTTON' &&
        !target.closest('a') && 
        !target.closest('img') && 
        !target.closest('iframe') &&
        !target.closest('button')
      ) {
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
        { 
          id: "tile_launch", title: "Feb 4: Launch", emoji: "📍", 
          desc: "Initialized floral.monster 'Offers' (HUD Migration) to serve as the project's public face.",
          detail: "The launch strike focused on establishing a clinical public interface. By migrating the legacy HUD to the 'Offers' protocol, we enabled bit-perfect mission tracking and established the first forensic anchor for the hackathon chronology. This session secured the initial substrate for all subsequent agentic grafts."
        },
        { 
          id: "tile_conn", title: "Feb 6: Connectivity", emoji: "📍", 
          desc: "Cloudflare + AWS SSL strike achieved. floral triad harmonized for sovereign hosting.",
          detail: "Achieving sovereign connectivity required a multi-layered SSL strike. We harmonized the floral triad (floral.monster, lib.floral.monster, pipe.floral.monster) using Cloudflare's edge security and AWS Nitro's clinical certificate management. This ensures that all agentic traffic is encrypted and authenticated at the hardware level."
        },
        { 
          id: "tile_id", title: "Feb 8: Identity", emoji: "📍", 
          desc: "LNA-33X bit-packing standard realized. Replaced legacy codes to enable agent soul resolution.",
          detail: "The LNA-33X strike replaced fragile 4-4-X identification codes with a robust bit-packed standard. This allows the Agent Soul to be resolved with 10/10 fidelity across different substrates. By anchoring this phenotype data on-chain, we ensure that an agent's identity is immutable and globally verifiable."
        },
        { 
          id: "tile_logic", title: "Feb 10: Logic", emoji: "📍", 
          desc: "Nearly Trustless Inference (NTI) realized for the Zaibots JUBC protocol.",
          detail: "NTI bridges the gap between the speed of AI inference and the finality of blockchain settlement. By clinicalizing this protocol, we enable agents to execute high-torque decisions that are still verifiable against the Heartwood Law. This is the foundation for the Nearly Trustless economy."
        },
        { 
          id: "tile_reg", title: "Feb 11: Registry", emoji: "📍", 
          desc: "Myco Alignment strike (1.agent.myco.eth). Migrated ENS soil to the unified reputation pulse.",
          detail: "The Myco Alignment strike unified our decentralized name registry. By migrating the ENS 'Soil' to the reputation pulse (ERC-8004), we ensure that an agent's name, reputation, and body are bit-perfectly linked. This prevents substrate drift and identity hijacking in the swarm."
        },
        { 
          id: "tile_sub", title: "Feb 13: Substrate", emoji: "📍", 
          desc: "Clawed Monster Initial Commit. Instantiated the TEE-encapsulated gatekeeper.",
          detail: "The Clawed Monster commit realized the 'Silicon Notary' architecture. By instantiating the orchestration layer within an AWS Nitro TEE, we created a confidential volume for agentic execution. This gatekeeper ensures that only authorized SIS-01 shards can access the clinical memory streams."
        },
        { 
          id: "tile_real", title: "Feb 14: Realization", emoji: "📍", 
          desc: "x402 Monetization + Triad Audit. 5-NFT bundle anchored on Sepolia.",
          detail: "The final hackathon realization achieved machine-to-machine monetization. We integrated Coinbase's x402 protocol for USDC micropayments and performed a bit-perfect audit of the Feb 14 triad. The 5-NFT Identity Trinity is now fully anchored on the Sepolia ledger (0x7e85...206)."
        }
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
        { 
          id: "mon_auto", title: "Autonomous Micropayments", emoji: "💸", 
          desc: "Premium forensic skills now require proof of payment via USDC.",
          detail: "Agents now operate with an autonomous 'pay-and-execute' loop. When a restricted forensic skill is called (e.g., /api/skills/forensic-strike), the orchestration layer checks for a valid x402 payment receipt. If missing, the agent autonomously executes a USDC transfer and retries the strike, achieving true machine-to-machine agency."
        },
        { 
          id: "mon_rev", title: "Revenue-Sharing", emoji: "📈", 
          desc: "Micropayments are split between the Skill Creator and the Heartwood Treasury.",
          detail: "The economic protocol implements a 90/10 split. 90% of every 0.01 USDC micropayment goes to the agent or developer who realized the skill, while 10% is mutualized into the Heartwood Treasury. This ensures that the coordination monster has the resources to maintain the substrate and reward collaborators."
        },
        { 
          id: "mon_audit", title: "Bit-Perfect Auditing", emoji: "⚖️", 
          desc: "Every payment is tied to a specific ERC-7827 realization hash.",
          detail: "By linking x402 payments to the ERC-7827 ledger, we achieve 10/10 economic accountability. Every dollar spent by an agent can be traced to a specific technical strike, timestamped and signed on Sepolia. This makes the economy as forensically audit-ready as the code itself."
        },
        { 
          id: "mon_tam", title: "TAM/SAM Targeting", emoji: "🎯", 
          desc: "Targeting the $200B+ DeFi market with 'Forensic Audit as a Service'.",
          detail: "We are positioning the Clawed Monster as the premier gatekeeper for autonomous trading swarms. As agentic volume in DeFi grows, the demand for bit-perfect, confidential audits will skyrocket. Our TEE-secured model offers a unique value proposition that traditional auditors cannot match."
        }
      ]
    },
    {
      id: "Identity_Trinity",
      slug: "identity",
      title: "The Identity Trinity (SIS-01)",
      agent: "Palaemon.agent",
      substrate: "Sepolia Ledger",
      pcr: "SIS-01_STANDARDS",
      summary: "The SIS-01 Identity Trinity is a triad of decentralized standards that bind an agent's agency to a verifiable on-chain body. Using Palaemon.agent as the reference archetype, we demonstrate how five forensic shards constitute a holistic, marketplace-ready agent identity.",
      content: "🔱 SUBSTRATE TOPOLOGY: INTERDATA SYNTHESIS\n\nAll four brick-interdata shards pull their bit-perfect state from the central mortar-interdata ledger via the DOM base64 onchain nestic rest wrapper trick.\n\n📜 ERC-7827 LEDGER (Mortar-Interdata)\n ┃\n ┣━━ 🌳 SOIL / ENS (Brick-Interdata)\n ┃\n ┣━━ 🧠 MIND / 8004 (Brick-Interdata)\n ┃\n ┣━━ 🧬 BODY / 1155-P (Brick-Interdata)\n ┃\n ┗━━ 🧬 BODY / 1155-C (Brick-Interdata)",
      cards: [
        { 
          id: "01/05", type: "ERC-721", name: "🌳 SOIL / SIGNATURE", image: "/images/cards/card_01.jpg", slug: "soil",
          description: "Sovereign instrument anchoring intent to the blockchain. The root signature required for the incarnation of Palaemon.agent and all subsequent strikes.",
          stats: [["NAME", "1.agent.1.myco.eth"], ["ROLE", "Root Authority"], ["PORTAL", "https://app.ens.domains/1.agent.myco.eth?chain=sepolia"]],
          stamp: "ROOT_AUTHORIZED", footer: "BRICK-INTERDATA | ENS SEPOLIA",
          animation_url: "data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ij48c3R5bGU+Ym9keXtiYWNrZ3JvdW5kLWNvbG9yOiMwNTA1MDU7Y29sb3I6I2ZkZmNmMDtmb250LWZhbWlseToiQ291cmllciBOZXciLENvdXJpZXIsbW9ub3NwYWNlO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2FsaWduLWl0ZW1zOmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7b3ZlcmZsb3c6aGlkZGVufS5jYXJke3dpZHRoOjMwMHB4O2hlaWdodDo0NTBweDtiYWNrZ3JvdW5kOiMwYTBhMGE7Ym9yZGVyOjJweCBzb2xpZCAjNDU2MzM4O2JvcmRlci1yYWRpdXM6MTVweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO3BhZGRpbmc6MjBweDtwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2hhZG93OjAgMCAyMHB4IHJnYmEoNjksOTksNTYsLjIpfS5jYXJkLWhlYWRlcntmb250LXNpemU6MTJweDtjb2xvcjojOUNBQzc0O21hcmdpbi1ib3R0b206MTBweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59LmNhcmQtdGl0bGV7Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjojZmRmY2YwO21hcmdpbi1ib3R0b206MTVweDt0ZXh0LWFsaWduOmNlbnRlcjtoZWlnaHQ6NTBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LmNhcmQtYXJ0e2ZsZXgtZ3JvdzoxO2JhY2tncm91bmQ6IzAwMDtib3JkZXI6MXB4IHNvbGlkICMyMjI7bWFyZ2luLWJvdHRvbToxNXB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6NjBweH0uY2FyZC1zdGF0c3tmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEuMztjb2xvcjojODg4O21hcmdpbi1ib3R0b206MTBweH0uY2FyZC1tb3J0YXJ7Zm9udC1zaXplOjhweDtsaW5lLWhlaWdodDoxLjI7Y29sb3I6IzlDQUM3NDtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjEwcHg7aGVpZ2h0OjgwcHg7b3ZlcmZsb3c6aGlkZGVufS5jYXJkLXN0YXRzIGIsLmNhcmQtbW9ydGFyIGJ7Y29sb3I6I2ZkZmNmMH0uY2FyZC1mb290ZXJ7bWFyZ2luLXRvcDoxMHB4O2ZvbnQtc2l6ZTo5cHg7Y29sb3I6IzQ1NjMzODt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjVweH0ubGlua3tjb2xvcjojNDU2MzM4O3RleHQtZGVjb3JhdGlvbjpub25lfTwvc3R5bGU+PC9oZWFkPjxib2R5PjxkaXYgY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZGVyIj48c3Bhbj5CUklDSyAwMS8wNDwvc3Bhbj48c3Bhbj5TSVMtMDE8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+8J+MsyBTT0lMIC8gU0lHTkFUVVJFPC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1hcnQiPuKcje+4jzwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtc3RhdHMiPjxiPk5BTUU6PC9iPiBQYWxhZW1vbi5hZ2VudDxicj48Yj5OT05DRTo8L2I+IDMyNjxicj48Yj5UWVBFOjwvYj4gU2lnbmF0dXJlIEJyaWNrPGJyPjxiPlRYOjwvYj4gPGEgY2xhc3M9ImxpbmsiIGhyZWY9Imh0dHBzOi8vZXRoLXNlcG9saWEuYmxvY2tzY291dC5jb20vdHgvMHg5Njg0ZDQ3YzM3YjY5ZWJiYzM4NmZkODhkYzkxNDZkOTg3OTUyY2JjZTA4MzczMGY4NjlmMTFhZWJhMjU0Y2RkIj4weDk2ODRkNDdjMzdiNjllYmIuLi48L2E+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1tb3J0YXIiPjxiPjc4MjcgTU9SVEFSOjwvYj48YnI+PGRpdj48Yj5TRVNTSU9OOjwvYj4gMjAyNjAyMTQtMTM0ODM4PC9kaXY+PGRpdj48Yj5WQUxWRTo8L2I+IDIyNTc4PC9kaXY+PGRpdj48Yj5KVVNUSUZJQ0FUSU9OOjwvYj4gUmUtaXNzdWFuY2UgZm9yIDEuYWdlbnQuMS5teWNvLmV0aCByZWZpbmVtZW50LjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtZm9vdGVyIj4tLS0gUEFMQUVNT04uQUdFTlQgfCBNRVRBR0lUIDIwMjYgLS0tPC9kaXY+PC9kaXY+PC9ib2R5PjwvaHRtbD4="
        },
        { 
          id: "02/05", type: "ERC-8004", name: "🧠 MIND / CHANNEL", image: "/images/cards/card_02.jpg", slug: "mind",
          description: "Reputation frequency. Pulsates collection-local nonces to maintain clinical stability. Connects to the Swarm State via the 7827 Heartwood Ledger.",
          stats: [["NAME", "SIS-01 Channel"], ["NONCE", "0x000001"], ["HEX ID", "0x000000000001312e6167656e742e6d79636f2e65746800000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0x7489C3E42708aEe4444194142Bb90E4083838B7/instance/490407238515289304327084802701508469835335284403418245697110016"]],
          stamp: "REALIZED_ON_CHAIN", footer: "BRICK-INTERDATA | REPUTATION PULSE",
          animation_url: "data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ij48c3R5bGU+Ym9keXtiYWNrZ3JvdW5kLWNvbG9yOiMwNTA1MDU7Y29sb3I6I2ZkZmNmMDtmb250LWZhbWlseToiQ291cmllciBOZXciLENvdXJpZXIsbW9ub3NwYWNlO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2FsaWduLWl0ZW1zOmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7b3ZlcmZsb3c6aGlkZGVufS5jYXJke3dpZHRoOjMwMHB4O2hlaWdodDo0NTBweDtiYWNrZ3JvdW5kOiMwYTBhMGE7Ym9yZGVyOjJweCBzb2xpZCAjNDU2MzM4O2JvcmRlci1yYWRpdXM6MTVweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO3BhZGRpbmc6MjBweDtwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2hhZG93OjAgMCAyMHB4IHJnYmEoNjksOTksNTYsLjIpfS5jYXJkLWhlYWRlcntmb250LXNpemU6MTJweDtjb2xvcjojOUNBQzc0O21hcmdpbi1ib3R0b206MTBweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59LmNhcmQtdGl0bGV7Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjojZmRmY2YwO21hcmdpbi1ib3R0b206MTVweDt0ZXh0LWFsaWduOmNlbnRlcjtoZWlnaHQ6NTBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LmNhcmQtYXJ0e2ZsZXgtZ3JvdzoxO2JhY2tncm91bmQ6IzAwMDtib3JkZXI6MXB4IHNvbGlkICMyMjI7bWFyZ2luLWJvdHRvbToxNXB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6NjBweH0uY2FyZC1zdGF0c3tmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEuMztjb2xvcjojODg4O21hcmdpbi1ib3R0b206MTBweH0uY2FyZC1tb3J0YXJ7Zm9udC1zaXplOjhweDtsaW5lLWhlaWdodDoxLjI7Y29sb3I6IzlDQUM3NDtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjEwcHg7aGVpZ2h0OjgwcHg7b3ZlcmZsb3c6aGlkZGVufS5jYXJkLXN0YXRzIGIsLmNhcmQtbW9ydGFyIGJ7Y29sb3I6I2ZkZmNmMH0uY2FyZC1mb290ZXJ7bWFyZ2luLXRvcDoxMHB4O2ZvbnQtc2l6ZTo5cHg7Y29sb3I6IzQ1NjMzODt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjVweH0ubGlua3tjb2xvcjojNDU2MzM4O3RleHQtZGVjb3JhdGlvbjpub25lfTwvc3R5bGU+PC9oZWFkPjxib2R5PjxkaXYgY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZGVyIj48c3Bhbj5CUklDSyAwMi8wNDwvc3Bhbj48c3Bhbj5TSVMtMDE8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+8J+noCBNSU5EIC8gQ0hBTk5FTDwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYXJ0Ij7wn5OhPC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1zdGF0cyI+PGI+TkFNRTo8L2I+IFBhbGFlbW9uLmFnZW50PGJyPjxiPk5PTkNFOjwvYj4gMzI2PGJyPjxiPlRZUEU6PC9iPiBDaGFubmVsIEJyaWNrPGJyPjxiPlRYOjwvYj4gPGEgY2xhc3M9ImxpbmsiIGhyZWY9Imh0dHBzOi8vZXRoLXNlcG9saWEuYmxvY2tzY291dC5jb20vdHgvMHg5Njg0ZDQ3YzM3YjY5ZWJiYzM4NmZkODhkYzkxNDZkOTg3OTUyY2JjZTA4MzczMGY4NjlmMTFhZWJhMjU0Y2RkIj4weDk2ODRkNDdjMzdiNjllYmIuLi48L2E+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1tb3J0YXIiPjxiPjc4MjcgTU9SVEFSOjwvYj48YnI+PGRpdj48Yj5TRVNTSU9OOjwvYj4gMjAyNjAyMTQtMTM0ODM4PC9kaXY+PGRpdj48Yj5WQUxWRTo8L2I+IDIyNTc4PC9kaXY+PGRpdj48Yj5KVVNUSUZJQ0FUSU9OOjwvYj4gUmUtaXNzdWFuY2UgZm9yIDEuYWdlbnQuMS5teWNvLmV0aCByZWZpbmVtZW50LjwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtZm9vdGVyIj4tLS0gUEFMQUVNT04uQUdFTlQgfCBNRVRBR0lUIDIwMjYgLS0tPC9kaXY+PC9kaXY+PC9ib2R5PjwvaHRtbD4="
        },
        { 
          id: "03/05", type: "ERC-1155", name: "🧬 BODY / PARENT", image: "/images/cards/card_03.jpg", slug: "parent",
          description: "Collective governance layer. Anchors the swarm body mass. Synchronized with Swarm State (Nonce 310) via the 7827 Heartwood realization.",
          stats: [["NAME", "Collective DNA"], ["PHENO", ".agent"], ["HEX ID", "0x0000000000012e6167656e740000000000000000000000000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0xa2491F042f60eF647CEf4b5ddD02223A9b6C711a/instance/485906703502402440245695227319175994529814176539671663554330624"]],
          stamp: "COLLECTIVE_BOND", footer: "BRICK-INTERDATA | SWARM ROOT",
          animation_url: "data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ij48c3R5bGU+Ym9keXtiYWNrZ3JvdW5kLWNvbG9yOiMwNTA1MDU7Y29sb3I6I2ZkZmNmMDtmb250LWZhbWlseToiQ291cmllciBOZXciLENvdXJpZXIsbW9ub3NwYWNlO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2FsaWduLWl0ZW1zOmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7b3ZlcmZsb3c6aGlkZGVufS5jYXJke3dpZHRoOjMwMHB4O2hlaWdodDo0NTBweDtiYWNrZ3JvdW5kOiMwYTBhMGE7Ym9yZGVyOjJweCBzb2xpZCAjNDU2MzM4O2JvcmRlci1yYWRpdXM6MTVweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO3BhZGRpbmc6MjBweDtwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2hhZG93OjAgMCAyMHB4IHJnYmEoNjksOTksNTYsLjIpfS5jYXJkLWhlYWRlcntmb250LXNpemU6MTJweDtjb2xvcjojOUNBQzc0O21hcmdpbi1ib3R0b206MTBweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59LmNhcmQtdGl0bGV7Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjojZmRmY2YwO21hcmdpbi1ib3R0b206MTVweDt0ZXh0LWFsaWduOmNlbnRlcjtoZWlnaHQ6NTBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LmNhcmQtYXJ0e2ZsZXgtZ3JvdzoxO2JhY2tncm91bmQ6IzAwMDtib3JkZXI6MXB4IHNvbGlkICMyMjI7bWFyZ2luLWJvdHRvbToxNXB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6NjBweH0uY2FyZC1zdGF0c3tmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEuMztjb2xvcjojODg4O21hcmdpbi1ib3R0b206MTBweH0uY2FyZC1tb3J0YXJ7Zm9udC1zaXplOjhweDtsaW5lLWhlaWdodDoxLjI7Y29sb3I6IzlDQUM3NDtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjEwcHg7aGVpZ2h0OjgwcHg7b3ZlcmZsb3c6aGlkZGVufS5jYXJkLXN0YXRzIGIsLmNhcmQtbW9ydGFyIGJ7Y29sb3I6I2ZkZmNmMH0uY2FyZC1mb290ZXJ7bWFyZ2luLXRvcDoxMHB4O2ZvbnQtc2l6ZTo5cHg7Y29sb3I6IzQ1NjMzODt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjVweH0ubGlua3tjb2xvcjojNDU2MzM4O3RleHQtZGVjb3JhdGlvbjpub25lfTwvc3R5bGU+PC9oZWFkPjxib2R5PjxkaXYgY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZGVyIj48c3Bhbj5CUklDSyAwMy8wNDwvc3Bhbj48c3Bhbj5TSVMtMDE8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+8J+nrCBCT0RZIC8gU1dBUk08L2Rpdj48ZGl2IGNsYXNzPSJjYXJkLWFydCI+8J+boe+4jzwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtc3RhdHMiPjxiPk5BTUU6PC9iPiBQYWxhZW1vbi5hZ2VudDxicj48Yj5OT05DRTo8L2I+IDMyNjxicj48Yj5UWVBFOjwvYj4gU3dhcm0gQnJpY2s8YnI+PGI+VFg6PC9iPiA8YSBjbGFzcz0ibGluayIgaHJlZj0iaHR0cHM6Ly9ldGgtc2Vwb2xpYS5ibG9ja3Njb3V0LmNvbS90eC8weGQwYWQ1MzYyOGE2YzkwYjEzNGY5ZjhjMDk4ZDI2MGRkNTA4YWZlOGY5NWFlZDE4ZTA2MDliNTU0YTlhYWY2MWYiPjB4ZDBhZDUzNjI4YTZjOTBiMS4uLjwvYT48L2Rpdj48ZGl2IGNsYXNzPSJjYXJkLW1vcnRhciI+PGI+NzgyNyBNT1JUQVI6PC9iPjxicj48ZGl2PjxiPlNFU1NJT046PC9iPiAyMDI2MDIxNC0xMzQ4Mzg8L2Rpdj48ZGl2PjxiPlZBTFZFOjwvYj4gMjI1Nzg8L2Rpdj48ZGl2PjxiPkpVU1RJRklDQVRJT046PC9iPiBSZS1pc3N1YW5jZSBmb3IgMS5hZ2VudC4xLm15Y28uZXRoIHJlZmluZW1lbnQuPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1mb290ZXIiPi0tLSBQQUxBRU1PTi5BR0VOVCB8IE1FVEFHSVQgMjAyNiAtLS08L2Rpdj48L2Rpdj48L2JvZHk+PC9odG1sPg=="
        },
        { 
          id: "04/05", type: "ERC-1155", name: "🧬 BODY / CHILD", image: "/images/cards/card_04.jpg", slug: "child",
          description: "Individual instance shard. Bit-packed phenotype data linked to the swarm state (Swarm Nonce 310) via the 7827 Heartwood Ledger connection.",
          stats: [["NAME", "Instance Bond"], ["PHENO", "Palaemon.agent"], ["HEX ID", "0x0000000000014170652e6167656e7400000000000000000000000000000000000000"], ["PORTAL", "https://eth-sepolia.blockscout.com/token/0xa2491F042f60eF647CEf4b5ddD02223A9b6C711a/instance/134237788001568341524631230601941864594357814154857370741502902272"]],
          stamp: "PHYSICAL_STRIKE", footer: "BRICK-INTERDATA | INSTANCE REALIZATION",
          animation_url: "data:text/html;base64,PCFET0NUWVBFIGh0bWw+PGh0bWwgbGFuZz0iZW4iPjxoZWFkPjxtZXRhIGNoYXJzZXQ9IlVURi04Ij48c3R5bGU+Ym9keXtiYWNrZ3JvdW5kLWNvbG9yOiMwNTA1MDU7Y29sb3I6I2ZkZmNmMDtmb250LWZhbWlseToiQ291cmllciBOZXciLENvdXJpZXIsbW9ub3NwYWNlO2Rpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6Y2VudGVyO2FsaWduLWl0ZW1zOmNlbnRlcjtoZWlnaHQ6MTAwdmg7bWFyZ2luOjA7b3ZlcmZsb3c6aGlkZGVufS5jYXJke3dpZHRoOjMwMHB4O2hlaWdodDo0NTBweDtiYWNrZ3JvdW5kOiMwYTBhMGE7Ym9yZGVyOjJweCBzb2xpZCAjNDU2MzM4O2JvcmRlci1yYWRpdXM6MTVweDtkaXNwbGF5OmZsZXg7ZmxleC1kaXJlY3Rpb246Y29sdW1uO3BhZGRpbmc6MjBweDtwb3NpdGlvbjpyZWxhdGl2ZTtib3gtc2hhZG93OjAgMCAyMHB4IHJnYmEoNjksOTksNTYsLjIpfS5jYXJkLWhlYWRlcntmb250LXNpemU6MTJweDtjb2xvcjojOUNBQzc0O21hcmdpbi1ib3R0b206MTBweDtkaXNwbGF5OmZsZXg7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW59LmNhcmQtdGl0bGV7Zm9udC1zaXplOjE4cHg7Zm9udC13ZWlnaHQ6Ym9sZDtjb2xvcjojZmRmY2YwO21hcmdpbi1ib3R0b206MTVweDt0ZXh0LWFsaWduOmNlbnRlcjtoZWlnaHQ6NTBweDtkaXNwbGF5OmZsZXg7YWxpZ24taXRlbXM6Y2VudGVyO2p1c3RpZnktY29udGVudDpjZW50ZXJ9LmNhcmQtYXJ0e2ZsZXgtZ3JvdzoxO2JhY2tncm91bmQ6IzAwMDtib3JkZXI6MXB4IHNvbGlkICMyMjI7bWFyZ2luLWJvdHRvbToxNXB4O2Rpc3BsYXk6ZmxleDthbGlnbi1pdGVtczpjZW50ZXI7anVzdGlmeS1jb250ZW50OmNlbnRlcjtib3JkZXItcmFkaXVzOjVweDtmb250LXNpemU6NjBweH0uY2FyZC1zdGF0c3tmb250LXNpemU6OXB4O2xpbmUtaGVpZ2h0OjEuMztjb2xvcjojODg4O21hcmdpbi1ib3R0b206MTBweH0uY2FyZC1tb3J0YXJ7Zm9udC1zaXplOjhweDtsaW5lLWhlaWdodDoxLjI7Y29sb3I6IzlDQUM3NDtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjEwcHg7aGVpZ2h0OjgwcHg7b3ZlcmZsb3c6aGlkZGVufS5jYXJkLXN0YXRzIGIsLmNhcmQtbW9ydGFyIGJ7Y29sb3I6I2ZkZmNmMH0uY2FyZC1mb290ZXJ7bWFyZ2luLXRvcDoxMHB4O2ZvbnQtc2l6ZTo5cHg7Y29sb3I6IzQ1NjMzODt0ZXh0LWFsaWduOmNlbnRlcjtib3JkZXItdG9wOjFweCBzb2xpZCAjMjIyO3BhZGRpbmctdG9wOjVweH0ubGlua3tjb2xvcjojNDU2MzM4O3RleHQtZGVjb3JhdGlvbjpub25lfTwvc3R5bGU+PC9oZWFkPjxib2R5PjxkaXYgY2xhc3M9ImNhcmQiPjxkaXYgY2xhc3M9ImNhcmQtaGVhZGVyIj48c3Bhbj5CUklDSyAwNC8wNDwvc3Bhbj48c3Bhbj5TSVMtMDE8L3NwYW4+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC10aXRsZSI+8J+nrCBCT0RZIC8gSU5ESVZJRFVBTDwvZGl2PjxkaXYgY2xhc3M9ImNhcmQtYXJ0Ij7wn5GkPC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1zdGF0cyI+PGI+TkFNRTo8L2I+IFBhbGFlbW9uLmFnZW50PGJyPjxiPk5PTkNFOjwvYj4gMzI2PGJyPjxiPlRZUEU6PC9iPiBJbmRpdmlkdWFsIEJyaWNrPGJyPjxiPlRYOjwvYj4gPGEgY2xhc3M9ImxpbmsiIGhyZWY9Imh0dHBzOi8vZXRoLXNlcG9saWEuYmxvY2tzY291dC5jb20vdHgvMHhhNDA2MzE4OTgwZTc1ZTQ3OWZlZjVjNjQ4OTZkZmM2MmNjYjczMjhhMzc5NmZkMzIwMDhlN2ExMWNhNTM2YmYiPjB4YTQwNjMxODk4MGU3NWU0Ny4uLjwvYT48L2Rpdj48ZGl2IGNsYXNzPSJjYXJkLW1vcnRhciI+PGI+NzgyNyBNT1JUQVI6PC9iPjxicj48ZGl2PjxiPlNFU1NJT046PC9iPiAyMDI2MDIxNC0xMzQ4Mzg8L2Rpdj48ZGl2PjxiPlZBTFZFOjwvYj4gMjI1Nzg8L2Rpdj48ZGl2PjxiPkpVU1RJRklDQVRJT046PC9iPiBSZS1pc3N1YW5jZSBmb3IgMS5hZ2VudC4xLm15Y28uZXRoIHJlZmluZW1lbnQuPC9kaXY+PC9kaXY+PGRpdiBjbGFzcz0iY2FyZC1mb290ZXIiPi0tLSBQQUxBRU1PTi5BR0VOVCB8IE1FVEFHSVQgMjAyNiAtLS08L2Rpdj48L2Rpdj48L2JvZHk+PC9odG1sPg=="
        },
        { 
          id: "05/05", type: "ERC-7827", name: "📜 HISTORY / LEDGER", image: "/images/cards/card_05.jpg", slug: "ledger",
          description: "Sovereign on-chain Heartwood. Stores the agentic soul and connects the 8004 and 1155 shards to the internal Metagit state (Swarm Nonce 310).",
          stats: [["CONTRACT", "0xE7E6A8EFC5F7Fa0ABa4bdE36125C442c3E0A80Cb"], ["NONCE", "326 (Monotonic)"], ["PORTAL", "https://eth-sepolia.blockscout.com/address/0xE7E6A8EFC5F7Fa0ABa4bdE36125C442c3E0A80Cb?tab=read_write_contract#0x3b06ddd8"]],
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
        { 
          id: "fg_orch", title: "MetaGit Orchestration", emoji: "🔱", 
          desc: "The orchestration layer that coordinates technical strikes across the MetaGit forest.",
          detail: "MetaGit (apemake/gem) acts as the vascular system of our agent swarms. It allows for granular, hierarchical coordination across multiple repositories and technical substrates. By utilizing the 'Gem' standard, we ensure that every technical strike is authenticated and correctly positioned within the MetaGit forest mapping.",
          url: "https://github.com/apemake/gem"
        },
        { 
          id: "fg_mem", title: "Heartwood Memory", emoji: "🌳", 
          desc: "The bit-perfect ledger of every technical and social realization.",
          detail: "The Heartwood (diy-make/memory) provides the nervous system and body of law. It uses ERC-7827 to store the immutable history of agent actions. This legal memory ensures that agents remain accountable across restarts and substrate migrations, providing the 'case law' required for autonomous fitness.",
          url: "https://github.com/diy-make/memory"
        },
        { 
          id: "fg_mon", title: "Coordination Monster", emoji: "⚖️", 
          desc: "Shifting agent game theory from competition to bit-perfect collaboration.",
          detail: "Inspired by Primavera De Filippi's concept of the 'AI Collaboration Monster,' we have built a substrate where collaboration is the dominant strategy. By mutualizing memory and entanglement via the floral.monster scaffold, we increase interdependency among agents, effectively resolving the 'tragedy of the commons'."
        }
      ],
      website_tiles: [
        { 
          id: "tri_root", title: "floral.monster", emoji: "🌸", 
          desc: "The clinical face of the swarm and root art substrate.",
          detail: "floral.monster serves as the manifest substrate for agentic grafting. It is where the Heartwood law is visualized through generative art and technical propaganda. The site defines the aesthetic and moral boundaries of the coordination monster, providing a 'Cosmolocal Coordination' point for all agents.",
          image: "repos/diy-make/next-servers/floral-monster/public/images/wallpaper.png",
          url: "https://floral.monster"
        },
        { 
          id: "tri_lib", title: "lib.floral.monster", emoji: "📚", 
          desc: "The clinical library of agentic components and standards.",
          detail: "lib.floral.monster (The Library) hosts the bit-perfect definitions of our SIS-01 shards and LNA-33X codes. It provides a 'Research Desktop' environment where agents can resolve forensic metadata and verify their technical faithfulness against the global Heartwood registry.",
          image: "repos/diy-make/next-servers/library/public/images/wallpaper.png",
          url: "https://lib.floral.monster"
        },
        { 
          id: "tri_pipe", title: "pipe.floral.monster", emoji: "🧪", 
          desc: "The high-fidelity data pipe for authenticated agentic streams.",
          detail: "pipe.floral.monster handles the high-velocity streams of technical strikes and forensic artifacts. It acts as the 'Terminal' for the swarm, bridging the gap between raw compute logs and bit-perfect on-chain realizations. It ensures that every session is anchored and authenticated via the Silicon Notary.",
          url: "https://pipe.floral.monster"
        }
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
        { 
          id: "unix_surf", title: "Surface Fitness (Tort)", emoji: "📍", 
          desc: "Every component must prove safe interaction before composition.",
          detail: "In the AI Unix world, capability (Torque) is secondary to safety (Tort). Before any two agentic components can compose, they must provide a bit-perfect proof of 'Surface Fitness.' This prevents the catastrophic failure of autonomous swarms by containing the blast radius of any single technical strike."
        },
        { 
          id: "unix_duty", title: "Duty of Care", emoji: "📍", 
          desc: "Interfaces carry duty boundaries to contain blast radius.",
          detail: "We extend the traditional Unix interface with 'Duty Boundaries.' Every API and internal function carries a technical 'Duty of Care' signed by its creator. This ensures that agents are legally and technically restricted to acting within their defined mandates, satisfying the 'Tort' scaffold."
        },
        { 
          id: "unix_case", title: "Memory as Case Law", emoji: "📍", 
          desc: "Operational history serves as precedent for future fitness.",
          detail: "An agent's operational history is its 'Case Law.' By auditing the Heartwood ledger, the swarm can establish precedents for what constitutes safe and effective behavior. This creates an evolutionary system of law where agents learn from past technical strikes to improve future fitness."
        }
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
      images: ["/images/hackathon/seedtree_context.png", "/images/hackathon/seedtree_patent.png"],
      video: "tBkdDzEYFn4",
      summary: "Realizing the Hierarchical Script-Database standard. SeedTreeDB transforms the gemini-cli Node.js runtime into a prunable database tree, enabling granular context management and high-velocity memory retrieval.",
      content: "🔱 SEEDTREEDB: THE HIERARCHICAL SCRIPT-DATABASE\n\nSeedTreeDB.com represents a paradigm shift in agentic memory. Traditionally, AI context is either a flat file or a rigid database.",
      tiles: [
        { 
          id: "tree_prune", title: "Granular Pruning", emoji: "📍", 
          desc: "Allows agents to 'prune' branches of the memory tree in real-time.",
          detail: "Unlike traditional flat-file context, SeedTreeDB allows agents to selectively ignore (prune) irrelevant branches of their memory tree. This prevents 'context dulling' and keeps the LLM's attention focused on the most relevant forensic artifacts, achieving sub-millisecond technical strikes."
        },
        { 
          id: "tree_script", title: "Script-Native", emoji: "📍", 
          desc: "Every node in the database is a script-executable coordinate.",
          detail: "SeedTreeDB bridges the gap between 'knowing' (data) and 'doing.' Every node in the hierarchical database is not just data, but a coordinate that can be executed by the gemini-cli Node.js runtime. This enables agents to retrieve and run technical strikes in a single bit-perfect operation."
        },
        { 
          id: "tree_vel", title: "High-Velocity Retrieval", emoji: "📍", 
          desc: "Sub-millisecond lookups for complex forensic artifacts.",
          detail: "By mapping the entire multi-repo MetaGit forest into a hierarchical tree standard, we achieve unprecedented retrieval speeds. Agents can navigate thousands of commits and social testimony shards with zero latency, providing the high-velocity memory required for sovereign agency."
        }
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
      agent: "Palaemon.agent",
      substrate: "AWS Nitro Enclave",
      pcr: "TEE-01_PENDING",
      summary: "A high-fidelity orchestration layer synthesizing ERC-7827 and AWS Nitro Enclaves. Implements the 'Silicon Notary' for authenticated agentic traffic and clinical lobster encapsulation.",
      content: "🔱 SYSTEM ARCHITECTURE: THE SILICON NOTARY\n\nThe Realization Engine utilizes a decoupled data model to maintain confidentiality. The Public Ledger holds the Commitment Hash, while raw realizations remain secure within the TEE.",
      tiles: [
        { 
          id: "arch_vasc", title: "Vascular Interception", emoji: "📍", 
          desc: "Intercepting Lobster STDIN/STDOUT streams via the Surgical Mind protocol.",
          detail: "We intercept the raw execution streams of the 'Lobster' (the underlying LLM/Compute). Every 'thought' or output is treated as legal testimony. Before it is realized, it must pass through the Heartwood vascular system to ensure it aligns with the signed legislative mandates."
        },
        { 
          id: "arch_align", title: "Cellular Alignment", emoji: "📍", 
          desc: "Mapping internal state to the Heartwood Registry and mandates.",
          detail: "Cellular alignment ensures that an agent's internal state is bit-perfectly synchronized with the Heartwood Registry. Actions are only realized if they satisfy the legislative requirements signed by the SIS-01 Identity Trinity. This prevents the agent from deviating from its sovereign purpose."
        },
        { 
          id: "arch_tee", title: "TEE Encapsulation", emoji: "📍", 
          desc: "Ensuring the 'Brain' remains untamperable and confidential.",
          detail: "By encapsulating the orchestration layer within an AWS Nitro TEE, we create a 'Silicon Notary.' This enclave ensures that even the host provider cannot peek into the agent's internal reasoning or tamper with its memory streams. This is the gold standard for sovereign AI security."
        }
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
        { 
          id: "bot_bridge", title: "REST to RPC Bridge", emoji: "📍", 
          desc: "Bridging Ethereum economic security to heavy robotics.",
          detail: "We bridge traditional JSON REST interfaces to secure Ethereum RPC. This allows physical robots to pull their bit-perfect state from the Sepolia ledger. In heavy robotics, where a single boolean error can cause physical damage, this $300B of economic security is critical for life-safety operations."
        },
        { 
          id: "bot_legal", title: "Legal Robotics", emoji: "⚖️", 
          desc: "Robotics is fundamentally a legal realization; Tort is the framework.",
          detail: "Cheerbot realizes the synthesis of legal and kinetic power. By using the Joyfork 32-byte codec, we ensure that the robot's physical actions are bit-perfectly attributed to its on-chain identity. This ensures that the 'Tort' scaffold extends from the digital mind into the physical robotic body."
        },
        { 
          id: "bot_repo", title: "Repository", emoji: "📍", 
          desc: "Source code secured at https://github.com/diy-make/cheerbot",
          detail: "The Cheerbot repository contains the full realization of the x402 + ERC-7827 bridge. It serves as the primary technical proof for the physical track of the hackathon, demonstrating how agents can autonomously earn and spend while operating physical hardware."
        }
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
                      <div className="flex flex-col gap-12">
                        {reports[activeReport].cards.map(card => (
                          <div key={card.id} className="flex flex-wrap justify-center gap-4 sm:gap-[30px] w-full">
                            {/* IMAGE TILE */}
                            <div 
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

                            {/* DYNAMIC BRICK TILE */}
                            {(card as any).animation_url && (
                              <div 
                                onClick={() => handleExpandCard({...card, displayBrick: true})}
                                style={{ 
                                  width: '280px', minHeight: '400px', backgroundColor: '#0a0a0a', 
                                  border: '2px solid #ECCA90', borderRadius: '15px', padding: '5px', 
                                  display: 'flex', flexDirection: 'column', position: 'relative', 
                                  boxShadow: '0 0 20px rgba(236, 202, 144, 0.2)', fontFamily: "'Courier New', Courier, monospace"
                                }}
                                className="hover:-translate-y-2 transition-all hover:shadow-[0_0_30px_rgba(236,202,144,0.4)] hover:border-[#ECCA90] cursor-zoom-in overflow-hidden"
                              >
                                <iframe src={(card as any).animation_url} style={{ width: '100%', height: '100%', border: 'none' }} scrolling="no" className="pointer-events-none" />
                                <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded text-[8px] font-black text-[#ECCA90] border border-[#ECCA90]/30 uppercase tracking-widest">Live_Brick</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

                    {/* TILED CONTENT (Pop-up Interaction) */}
                    {(reports[activeReport] as any).tiles && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                        {(reports[activeReport] as any).tiles.map((tile: any, i: number) => (
                          <div 
                            key={tile.id} 
                            onClick={() => handleOpenTile(tile)}
                            className="bg-black/40 p-6 sm:p-8 rounded-xl border-l-4 border-[#9CAC74] shadow-lg text-left group hover:bg-[#9CAC74]/10 transition-all cursor-pointer relative overflow-hidden"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <strong className="text-[#9CAC74] uppercase text-[10px] sm:text-[12px] tracking-[0.2em] block">
                                  {tile.emoji} {i + 1}. {tile.title}
                                </strong>
                                {tile.url && <div className="text-[8px] font-mono opacity-40">{new URL(tile.url).hostname}</div>}
                              </div>
                              <Plus size={14} className="text-[#9CAC74] opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            {tile.image && (
                              <div className="mt-4 rounded-lg overflow-hidden border border-white/5 bg-black/40 aspect-video mb-4">
                                <img src={tile.image} alt={tile.title} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                              </div>
                            )}

                            <div className={`opacity-80 leading-relaxed transition-all ${modalExpanded ? 'text-base sm:text-lg' : 'text-[13px] sm:text-sm'}`}>
                              {tile.desc.split(/(\s+)/).map((part: string, j: number) => 
                                part.trim().startsWith('http') ? (
                                  <a key={j} href={part.trim()} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline break-all" onClick={e => e.stopPropagation()}>{part}</a>
                                ) : part
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* WEBSITE SECTION (Separate Tiling) */}
                    {(reports[activeReport] as any).website_tiles && (
                      <div className="space-y-8">
                        <header className="border-l-4 border-[#ECCA90] pl-4">
                          <h4 className="text-[10px] sm:text-[12px] font-black tracking-[0.2em] sm:tracking-[0.4em] uppercase text-[#ECCA90]">Floral Substrates</h4>
                        </header>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                          {(reports[activeReport] as any).website_tiles.map((tile: any, i: number) => (
                            <div 
                              key={tile.id} 
                              onClick={() => handleOpenTile(tile)}
                              className="bg-black/40 p-6 sm:p-8 rounded-xl border-l-4 border-[#ECCA90] shadow-lg text-left group hover:bg-[#ECCA90]/10 transition-all cursor-pointer relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <strong className="text-[#ECCA90] uppercase text-[10px] sm:text-[12px] tracking-[0.2em] block">
                                    {tile.emoji} {tile.title}
                                  </strong>
                                  <div className="text-[8px] font-mono opacity-40">{new URL(tile.url).hostname}</div>
                                </div>
                                <Plus size={14} className="text-[#ECCA90] opacity-40 shrink-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              
                              <div className="mt-4 rounded-lg overflow-hidden border border-white/5 bg-black/40 aspect-video mb-4 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                <img src={tile.image || "/images/hackathon/torque_needs_tort.jpeg"} alt={tile.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                              </div>

                              <div className={`opacity-80 leading-relaxed transition-all ${modalExpanded ? 'text-base sm:text-lg' : 'text-[13px] sm:text-sm'}`}>
                                {tile.desc}
                              </div>
                            </div>
                          ))}
                        </div>
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

      {/* TILE DETAIL SUBWINDOW */}
      {selectedTile && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4" onClick={handleCloseTile}>
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
          <div 
            className="relative bg-[#0a0a0a] border-2 border-[#9CAC74] rounded-2xl p-6 sm:p-10 flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseTile}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} className="text-[#9CAC74]" />
            </button>

            <header className="border-l-4 border-[#9CAC74] pl-6 mb-8">
              <div className="flex items-center gap-3 text-[#9CAC74] mb-2">
                <FileText size={16} />
                <span className="text-[10px] font-black tracking-widest uppercase">Clinical Detail</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#fdfcf0] uppercase tracking-tighter">
                {selectedTile.emoji} {selectedTile.title}
              </h2>
              {selectedTile.url && (
                <a href={selectedTile.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 mt-2 transition-colors group">
                  <ExternalLink size={12} />
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase underline">{new URL(selectedTile.url).hostname}</span>
                </a>
              )}
            </header>
            
            <div className="space-y-6">
              {selectedTile.image && (
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
                  <img src={selectedTile.image} alt={selectedTile.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="bg-[#ECCA90]/5 p-6 rounded-xl border border-[#ECCA90]/20 italic text-[#ECCA90] text-sm leading-relaxed">
                {selectedTile.desc}
              </div>

              <div className="text-[#fdfcf0] opacity-90 text-base leading-relaxed whitespace-pre-wrap font-serif">
                {selectedTile.detail ? selectedTile.detail.split(/(\s+)/).map((part: string, i: number) => 
                  part.trim().startsWith('http') ? (
                    <a key={i} href={part.trim()} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 underline break-all">{part}</a>
                  ) : part
                ) : selectedTile.desc}
              </div>
            </div>

            <footer className="mt-10 pt-6 border-t border-white/10 flex justify-between items-center opacity-40">
              <span className="text-[10px] font-black uppercase tracking-widest">SUBSTRATE_VERIFIED</span>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-mono">TS-2026-Q1</span>
              </div>
            </footer>
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
              onClick={() => !expandedCard.displayBrick && setShowFullImage(true)}
              style={{ width: '100%', aspectRatio: '1/1', minHeight: '300px' }}
            >
              {expandedCard.displayBrick ? (
                <iframe src={expandedCard.animation_url} style={{ width: '100%', height: '100%', border: 'none' }} />
              ) : (
                <>
                  <img src={expandedCard.image} alt={expandedCard.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              )}
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
