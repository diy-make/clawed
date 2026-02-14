import { NextRequest, NextResponse } from "next/server";
import { verifySovereignAccess } from "@/lib/forensic-gate";
import { createRealization } from "@/lib/erc7827";
import { logForensicEvent } from "@/lib/forensic-logger";

const LOBSTER_ENDPOINT = "http://98.87.28.157:3000";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify SIS-01 Access
    const identity = await verifySovereignAccess(request);

    // 2. Intercept and Wrap Request
    const body = await request.json();
    const requestRealization = await createRealization(
      "LobsterRequest",
      {
        identity: identity.address,
        payload: body,
        method: "POST",
        path: "/api/lobster"
      },
      identity.address
    );

    // Secure the request log
    await logForensicEvent(requestRealization);

    // 3. Forward to Active Lobster
    const response = await fetch(LOBSTER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Clawed-Monster-Attestation": JSON.stringify(requestRealization)
      },
      body: JSON.stringify(body)
    });

    const responseData = await response.json();

    // 4. Wrap Response
    const responseRealization = await createRealization(
      "LobsterResponse",
      {
        identity: identity.address,
        status: response.status,
        payload: responseData
      },
      "ClawedMonster.agent"
    );

    // Secure the response log
    await logForensicEvent(responseRealization);

    // 5. Return Forensic Payload
    return NextResponse.json({
      ...responseData,
      _forensic: {
        request: requestRealization,
        response: responseRealization
      }
    });

  } catch (error: any) {
    console.error("[LOBSTER-PROXY] Error:", error.message);
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const identity = await verifySovereignAccess(request);
    
    const response = await fetch(LOBSTER_ENDPOINT);
    const data = await response.text();

    return new NextResponse(data, {
      headers: {
        "Content-Type": "text/html",
        "X-Clawed-Monster-Identity": identity.address
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}
