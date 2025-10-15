// app/api/account/route.ts
import { NextRequest, NextResponse } from 'next/server';
import AnonNeobankSDK from '@/lib/sdk';

const sdk = new AnonNeobankSDK(
  process.env.NEXT_PUBLIC_GRID_API_KEY!,
  process.env.NEXT_PUBLIC_GRID_ENVIRONMENT as 'sandbox' | 'production',
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create':
        const createResult = await sdk.createEmailAccount(body.email);
        return NextResponse.json(createResult);

      case 'verify':
        const verifyResult = await sdk.completeAccountCreation(
          {
            user: body.user,
            sessionSecrets: body.sessionSecrets,
            email: body.email
          },
          body.otpCode
        );
        return NextResponse.json(verifyResult);

      case 'balance':
        const balances = await sdk.getAccountBalances(body.address);
        return NextResponse.json(balances);

      case 'transfer':
        if (body.usePrivacy) {
          return NextResponse.json(
            { error: 'Private transfers coming soon - Umbra integration in development' },
            { status: 501 }
          );
        }
        
        const signature = await sdk.createRegularTransfer(
          body.userState,
          body.recipient,
          body.amount,
          body.mint
        );
        return NextResponse.json({ signature });

      case 'history':
        const history = await sdk.getTransferHistory(body.address, body.limit || 10);
        return NextResponse.json(history);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address required' },
      { status: 400 }
    );
  }

  try {
    const balances = await sdk.getAccountBalances(address);
    return NextResponse.json(balances);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}