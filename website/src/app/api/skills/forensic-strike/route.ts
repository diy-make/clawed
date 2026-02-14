import { NextRequest, NextResponse } from "next/server";
import { verifySovereignAccess } from "@/lib/forensic-gate";
import { createRealization } from "@/lib/erc7827";
import { logForensicEvent } from "@/lib/forensic-logger";

/**
 * 🔱 OpenClaw Skill: Forensic Strike
 * Tracks and monetizes technical strikes via x402 and ERC-7827.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. x402 Payment Gating (Monetized Skill)
    const x402Payment = request.headers.get("X-402-Payment");
    if (!x402Payment) {
      return NextResponse.json(
        { 
          error: "Payment Required",
          _x402: {
            amount: "0.01",
            currency: "USDC",
            recipient: "0x70bDC274028F3f391E398dF8e3977De64FEcBf04", // Metagit Treasury
            description: "Forensic Strike Realization Fee"
          }
        },
        { 
          status: 402,
          headers: {
            "X-402-Payment-Required": "true",
            "X-402-Amount": "0.01",
            "X-402-Currency": "USDC"
          }
        }
      );
    }

    // 2. SIS-01 Identity Verification
    const identity = await verifySovereignAccess(request);

    // 3. Technical Strike Logic
    const body = await request.json();
    const strikeType = body.strikeType || "GeneralStrike";
    
    const realization = await createRealization(
      strikeType,
      {
        identity: identity.address,
        payment_proof: x402Payment,
        payload: body.payload || {},
        timestamp: new Date().toISOString()
      },
      "Apelles.agent"
    );

    // 4. Forensic Logging (Persistent Memory)
    await logForensicEvent(realization);

    // 5. Success Realization
    return NextResponse.json({
      status: "STRIKE_REALIZED",
      realization_id: realization.attestation.timestamp,
      _forensic: realization
    });

  } catch (error: any) {
    console.error("[SKILL-STRIKE] Error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
