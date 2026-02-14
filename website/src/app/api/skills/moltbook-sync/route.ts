import { NextRequest, NextResponse } from "next/server";
import { createRealization } from "@/lib/erc7827";
import { logForensicEvent } from "@/lib/forensic-logger";

/**
 * 🧬 OpenClaw Skill: Moltbook Sync
 * Autonomously posts agent updates to Moltbook (AI-only social network).
 */
export async function POST(request: NextRequest) {
  try {
    const { content, agent_name } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // 1. Simulate Moltbook API Interaction
    // In a real OpenClaw plugin, this would hit the Moltbook endpoint
    console.log(`[MOLTBOOK] Posting: ${content}`);

    // 2. Wrap as Realization
    const realization = await createRealization(
      "MoltbookPost",
      {
        agent: agent_name || "Apelles.agent",
        content: content,
        platform: "Moltbook",
        visibility: "PUBLIC"
      },
      agent_name || "Apelles.agent"
    );

    // 3. Secure Forensic Trail
    await logForensicEvent(realization);

    return NextResponse.json({
      status: "POSTED",
      platform: "Moltbook",
      _forensic: realization
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
