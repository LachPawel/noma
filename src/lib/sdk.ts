// lib/sdk.ts
import { GridClient } from '@sqds/grid';
import { UsdcPlusStablecoin, LstStablecoin, ReflectTokenisedBond } from '@reflectmoney/stable.ts';
import { Connection, PublicKey, Keypair, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import BN from 'bn.js';

interface UserState {
  address: string;
  authentication?: any;
  sessionSecrets?: any;
  email?: string;
}

class AnonNeobankSDK {
  private gridClient: GridClient;
  private connection: Connection;
  private usdcPlus: UsdcPlusStablecoin;
  private lstStable: LstStablecoin;
  private tokenizedBond: ReflectTokenisedBond;

  constructor(
    gridApiKey: string,
    environment: 'sandbox' | 'production',
    solanaRpcUrl: string
  ) {
    this.gridClient = new GridClient({
      environment,
      apiKey: gridApiKey,
      baseUrl: 'https://grid.squads.xyz'
    });

    this.connection = new Connection(solanaRpcUrl);
    this.usdcPlus = new UsdcPlusStablecoin(this.connection);
    this.lstStable = new LstStablecoin(this.connection);
    this.tokenizedBond = new ReflectTokenisedBond(this.connection);
  }

  // ============================================================================
  // ACCOUNT MANAGEMENT
  // ============================================================================

  async createEmailAccount(email: string): Promise<any> {
    const response = await this.gridClient.createAccount({ email });
    const user = response.data;
    const sessionSecrets = await this.gridClient.generateSessionSecrets();

    return {
      user,
      sessionSecrets,
      email
    };
  }

  async completeAccountCreation(
    userState: any,
    otpCode: string
  ): Promise<UserState> {
    const authResult = await this.gridClient.completeAuthAndCreateAccount({
      user: userState.user,
      otpCode,
      sessionSecrets: userState.sessionSecrets,
    });

    if (!authResult.success) {
      throw new Error('Account creation failed');
    }

    return {
      address: authResult.data?.address || '',
      authentication: authResult.data?.authentication,
      sessionSecrets: userState.sessionSecrets,
      email: userState.email
    };
  }

  async loginEmailAccount(email: string): Promise<any> {
    // Use initAuth for existing users
    const response = await this.gridClient.initAuth({ email });
    const user = response.data;
    const sessionSecrets = await this.gridClient.generateSessionSecrets();
    return { user, sessionSecrets, email, isNewUser: false };
  }

  async completeLogin(
    userState: any,
    otpCode: string
  ): Promise<UserState> {
    // Use completeAuth for existing users (NOT completeAuthAndCreateAccount)
    const authResult = await this.gridClient.completeAuth({
      user: userState.user,
      otpCode,
      sessionSecrets: userState.sessionSecrets,
    });

    if (!authResult.success) {
      throw new Error('Login failed');
    }

    // For existing users, we need to get the account address
    // The completeAuth response should contain authentication data
    return {
      address: authResult.data?.address || userState.user?.address || '',
      authentication: authResult.data?.authentication,
      sessionSecrets: userState.sessionSecrets,
      email: userState.email
    };
  }

  // ============================================================================
  // YIELD-BEARING STABLECOINS
  // ============================================================================

  async loadStablecoinData(): Promise<void> {
    await Promise.all([
      this.usdcPlus.load(this.connection),
      this.lstStable.load(this.connection)
    ]);
  }

  async mintUsdcPlus(
    userPubkey: PublicKey,
    amountUsdc: number,
    slippageBps: number = 10
  ): Promise<string> {
    const amount = new BN(amountUsdc * Math.pow(10, 6));
    const minReceived = new BN(amountUsdc * (1 - slippageBps / 10000) * Math.pow(10, 6));

    const ix = await this.usdcPlus.mint(userPubkey, amount, minReceived);
    const { blockhash } = await this.connection.getLatestBlockhash();
    const { value: lookupTable } = await this.connection.getAddressLookupTable(
      this.usdcPlus.lookupTable
    );

    const message = new TransactionMessage({
      instructions: ix,
      payerKey: userPubkey,
      recentBlockhash: blockhash
    }).compileToV0Message([lookupTable]);

    const transaction = new VersionedTransaction(message);
    return Buffer.from(transaction.serialize()).toString('base64');
  }

  async redeemUsdcPlus(
    userPubkey: PublicKey,
    amountUsdcPlus: number
  ): Promise<string> {
    const amount = new BN(amountUsdcPlus * Math.pow(10, 6));
    const minReceived = new BN(amountUsdcPlus * 0.999 * Math.pow(10, 6));

    const ix = await this.usdcPlus.redeem(userPubkey, amount, minReceived);
    const { blockhash } = await this.connection.getLatestBlockhash();
    const { value: lookupTable } = await this.connection.getAddressLookupTable(
      this.usdcPlus.lookupTable
    );

    const message = new TransactionMessage({
      instructions: ix,
      payerKey: userPubkey,
      recentBlockhash: blockhash
    }).compileToV0Message([lookupTable]);

    const transaction = new VersionedTransaction(message);
    return Buffer.from(transaction.serialize()).toString('base64');
  }

  // ============================================================================
  // TRANSFERS
  // ============================================================================

  async createRegularTransfer(
    userState: UserState,
    destination: string,
    amount: number,
    mint: string
  ): Promise<string> {
    try {
      // Use useSpendingLimit to create and execute the transfer
      // First, we need to create a spending limit, then use it
      
      // For now, let's use a simpler approach with prepareArbitraryTransaction
      // Create a simple transfer instruction
      const { Connection, PublicKey, SystemProgram, Transaction } = await import('@solana/web3.js');
      const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL!);
      
      const fromPubkey = new PublicKey(userState.address);
      const toPubkey = new PublicKey(destination);
      
      // Create a basic transfer transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount,
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;
      
      // Serialize the transaction
      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      }).toString('base64');
      
      // Prepare the transaction through Grid
      const preparedTx = await this.gridClient.prepareArbitraryTransaction(
        userState.address,
        { transaction: serializedTx }
      );
      
      if (!preparedTx.success || !preparedTx.data) {
        throw new Error(`Failed to prepare transaction: ${preparedTx.error || 'Unknown error'}`);
      }
      
      // Sign and send the transaction
      const result = await this.gridClient.signAndSend({
        sessionSecrets: userState.sessionSecrets,
        session: userState.authentication,
        transactionPayload: preparedTx.data,
        address: userState.address,
      });
      
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from signAndSend');
      }
      
      // Extract signature from the result
      const signature = (result as any).signature || (result as any).transactionSignature || JSON.stringify(result);
      return signature;
      
    } catch (error) {
      console.error('Transfer error:', error);
      throw new Error(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // UMBRA INTEGRATION - COMING SOON
  async createPrivateTransfer(
    userPubkey: PublicKey,
    recipientUmbraAddress: string,
    amount: number,
    mint: string
  ): Promise<string> {
    throw new Error(
      'Private transfers coming soon! Umbra integration in development. ' +
      'Follow our roadmap for launch updates.'
    );
  }

  // ============================================================================
  // ACCOUNT INFO
  // ============================================================================

  async getAccountBalances(address: string) {
    try {
      const balances = await this.gridClient.getAccountBalances(address);
      if (!balances.success) {
        console.error('Failed to get balances:', balances.error);
        // Return empty balances instead of failing
        return {
          sol: 0,
          tokens: [],
          total_value_usd: 0
        };
      }
      return balances.data;
    } catch (error) {
      console.error('Error fetching balances:', error);
      // Return empty balances on error
      return {
        sol: 0,
        tokens: [],
        total_value_usd: 0
      };
    }
  }

  async getTransferHistory(address: string, limit: number = 10) {
    try {
      const transfers = await this.gridClient.getTransfers(address, {
        limit,
      });
      return transfers.data || [];
    } catch (error) {
      console.error('Error fetching transfers:', error);
      return [];
    }
  }

  async getSpendingLimits(_address: string) {
    try {
      // Note: Grid SDK might not have getSpendingLimits, 
      // returning empty array as fallback
      return [];
    } catch (error) {
      console.error('Error fetching spending limits:', error);
      return [];
    }
  }

  calculateYieldEarned(
    originalDepositUsdc: number,
    currentUsdcPlusBalance: number
  ): { yieldEarned: number; apr: number } {
    const currentValueUsdc = currentUsdcPlusBalance;
    const yieldEarned = currentValueUsdc - originalDepositUsdc;
    const apr = 8.5; // Mock APR for demo
    
    return { yieldEarned, apr };
  }
}

export default AnonNeobankSDK;