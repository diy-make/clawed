import { ethers } from "ethers";

export interface ERC7827Realization {
  protocol: "ERC-7827";
  version: "1.0.0";
  type: string;
  metadata: Record<string, any>;
  parent_agent: string;
  attestation: {
    trinity_ref: string;
    timestamp: number;
    signature?: string;
  };
}

export async function createRealization(
  type: string,
  metadata: Record<string, any>,
  agentName: string,
  privateKey?: string
): Promise<ERC7827Realization> {
  const realization: ERC7827Realization = {
    protocol: "ERC-7827",
    version: "1.0.0",
    type,
    metadata,
    parent_agent: ".agent",
    attestation: {
      trinity_ref: "1.agent.myco.eth",
      timestamp: Math.floor(Date.now() / 1000),
    },
  };

  if (privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    const message = JSON.stringify(realization);
    const signature = await wallet.signMessage(message);
    realization.attestation.signature = signature;
  }

  return realization;
}
