import { NextRequest } from "next/server";
import { ethers } from "ethers";

const SIS01_REGISTRY = "0x931bDf63b461804af437d438Dd1e71Dc918033e9";
const SIS01_AGENT_ROLES = "0xa2491F042f60eF647CEf4b5ddD02223A9b6C711a";
const SEPOLIA_ENS_REGISTRAR = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

const ABI_721 = [
  "function balanceOf(address owner) external view returns (uint256)"
];

const ABI_1155 = [
  "function balanceOf(address account, uint256 id) external view returns (uint256)"
];

const CLICKWRAP_MESSAGE = (nonce: string) => `I agree to enter the metagit feed. Session Nonce: ${nonce}`;

// 🔱 SIS-01 Standard Shards
const AGENT_COLLECTIVE_ID = "10467640092495289328369578738714176451810473862239326449468279095296";
const ROLE_UX_ADMIN = "10";

export async function verifySovereignAccess(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  const body = await request.json().catch(() => ({}));
  const address = (request.headers.get("X-Forensic-Identity") || searchParams.get("X-Forensic-Identity") || body.address)?.toLowerCase();
  const signature = request.headers.get("X-Forensic-Signature") || searchParams.get("X-Forensic-Signature") || body.signature;
  const nonce = request.headers.get("X-Forensic-Nonce") || searchParams.get("X-Forensic-Nonce") || body.nonce;

  if (!address || !signature || !nonce) {
    throw new Error("Handshake Required: Missing forensic headers.");
  }

  // 1. Verify Signature
  const recoveredAddress = ethers.verifyMessage(CLICKWRAP_MESSAGE(nonce), signature);
  if (recoveredAddress.toLowerCase() !== address) {
    throw new Error("Identity Mismatch: Handshake failed.");
  }

  // 2. SIS-01 Tripartite Gating Check
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL || "https://sepolia.drpc.org");
  
  // A. Check 1155 Agent Shards (Vertical Institutional)
  const agentContract = new ethers.Contract(SIS01_AGENT_ROLES, ABI_1155, provider);
  const agentBalance = await agentContract.balanceOf(address, AGENT_COLLECTIVE_ID).catch(() => 0n);
  const adminBalance = await agentContract.balanceOf(address, ROLE_UX_ADMIN).catch(() => 0n);
  
  const hasInstitutionalAccess = agentBalance > 0n || adminBalance > 0n;

  // B. Check ENS Possession (Vertical Extitutional)
  const ensContract = new ethers.Contract(SEPOLIA_ENS_REGISTRAR, ABI_721, provider);
  const ensBalance = await ensContract.balanceOf(address).catch(() => 0n);
  
  // C. Check 8004 Channel (Horizontal Extitutional)
  const registryContract = new ethers.Contract(SIS01_REGISTRY, ABI_721, provider);
  const registryBalance = await registryContract.balanceOf(address).catch(() => 0n);

  const hasAccess = hasInstitutionalAccess || ensBalance > 0n || registryBalance > 0n;

  if (!hasAccess) {
    console.warn(`[FORENSIC-GATE] Access DENIED for ${address}`);
    const error = new Error("Access Denied: SIS-01 Identity Shard not found.") as any;
    error.status = 403;
    throw error;
  }

  console.log(`[FORENSIC-GATE] Access GRANTED for ${address}. ENS: ${ensBalance}, 8004: ${registryBalance}, 1155: ${hasInstitutionalAccess}`);
  
  return { 
    address, 
    authorizedId: adminBalance > 0n ? "ADMIN" : (agentBalance > 0n ? "CELL" : "SIS01_VISITOR") 
  };
}