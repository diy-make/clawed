import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const sessionId = Math.random().toString(36).substring(2, 10);
    const filename = `${timestamp.replace(/[:.]/g, '-')}_${sessionId}_subscription.json`;
    
    // Path to the Heartwood memory
    // Note: In production, this would be a hardened path on the server
    const memoryPath = path.join(process.cwd(), '../../../memory/public/json/subscriptions');
    
    if (!fs.existsSync(memoryPath)) {
      fs.mkdirSync(memoryPath, { recursive: true });
    }

    const subscriptionManifest = {
      id: `sub:${sessionId}`,
      type: "NewsletterSubscription",
      protocol: "x402-clickwrap",
      status: "Ratified",
      email: email,
      timestamp: timestamp,
      metadata: {
        origin: "floral.monster",
        version: "1.0.0",
        forensic_anchoring: "session_wood"
      }
    };

    fs.writeFileSync(
      path.join(memoryPath, filename),
      JSON.stringify(subscriptionManifest, null, 2)
    );

    return NextResponse.json({ 
      status: '200 OK', 
      message: 'Subscription Ratified',
      manifest: filename
    });

  } catch (error: any) {
    console.error('[SUBSCRIPTION ERROR]', error.message);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}
