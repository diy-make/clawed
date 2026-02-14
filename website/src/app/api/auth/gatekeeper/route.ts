import { NextResponse, NextRequest } from 'next/server';
import { verifySovereignAccess } from '../../../../lib/forensic-gate';

export async function POST(request: NextRequest) {
  try {
    const result = await verifySovereignAccess(request);

    return NextResponse.json({ 
      status: '200 OK', 
      message: 'Access Granted: NFT Verified',
      address: result.address,
      authorizedId: result.authorizedId
    });

  } catch (error: any) {
    console.error('[GATEKEEPER ERROR]', error.message);
    return NextResponse.json({ 
      error: error.message || 'Internal Server Error' 
    }, { status: error.status || 500 });
  }
}