// app/api/account/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to prevent client-side bundling
async function getSDK() {
  const { default: AnonNeobankSDK } = await import('@/lib/sdk');
  return new AnonNeobankSDK(
    process.env.NEXT_PUBLIC_GRID_API_KEY!,
    process.env.NEXT_PUBLIC_GRID_ENVIRONMENT as 'sandbox' | 'production',
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    const sdk = await getSDK();

    switch (action) {
      case 'create':
        // For NEW users: use createAccount
        const createResult = await sdk.createEmailAccount(body.email);
        return NextResponse.json(createResult);

      case 'login':
        // For EXISTING users: use initAuth
        const loginResult = await sdk.loginEmailAccount(body.email);
        return NextResponse.json(loginResult);

      case 'verify': {
        // Check if this is a new user or existing user login
        const isNewUser = body.isNewUser !== false; // Default to true for backwards compatibility
        
        if (isNewUser) {
          // New user: complete auth and create account
          const createAccountResult = await sdk.completeAccountCreation(
            {
              user: body.user,
              sessionSecrets: body.sessionSecrets,
              email: body.email
            },
            body.otpCode
          );
          return NextResponse.json(createAccountResult);
        } else {
          // Existing user: just complete auth
          const loginResult = await sdk.completeLogin(
            {
              user: body.user,
              sessionSecrets: body.sessionSecrets,
              email: body.email
            },
            body.otpCode
          );
          return NextResponse.json(loginResult);
        }
      }

      case 'balance':
        const balances = await sdk.getAccountBalances(body.address);
        return NextResponse.json(balances);

      case 'transfer': {
        if (body.usePrivacy) {
          return NextResponse.json(
            { error: 'Private transfers coming soon - Umbra integration in development' },
            { status: 501 }
          );
        }
        
        const transferSignature = await sdk.createRegularTransfer(
          body.userState,
          body.recipient,
          body.amount,
          body.mint
        );
        return NextResponse.json({ signature: transferSignature });
      }

      case 'history': {
        const history = await sdk.getTransferHistory(body.address, body.limit || 10);
        return NextResponse.json(history);
      }

      case 'convert': {
        await sdk.loadStablecoinData();
        const { PublicKey } = await import('@solana/web3.js');
        const transaction = await sdk.mintUsdcPlus(
          new PublicKey(body.publicKey),
          body.amount
        );
        return NextResponse.json({ transaction });
      }

      case 'submit': {
        const { Connection } = await import('@solana/web3.js');
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL!
        );
        const txBuffer = Buffer.from(body.signedTransaction, 'base64');
        const submitSignature = await connection.sendRawTransaction(txBuffer);
        await connection.confirmTransaction(submitSignature);
        return NextResponse.json({ signature: submitSignature });
      }

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
    const sdk = await getSDK();
    const balances = await sdk.getAccountBalances(address);
    return NextResponse.json(balances);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}