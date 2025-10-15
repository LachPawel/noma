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
    const spendingLimitPayload = {
      amount: amount,
      mint: mint,
      period: 'one_time' as const,
      destinations: [destination],
    };

    const result = await this.gridClient.createSpendingLimit(
      userState.address,
      spendingLimitPayload
    );

    const signature = await this.gridClient.signAndSend({
      sessionSecrets: userState.sessionSecrets,
      session: userState.authentication,
      transactionPayload: result.data,
      address: userState.address,
    });

    return signature;
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
    const balances = await this.gridClient.getAccountBalances(address);
    return balances.data;
  }

  async getTransferHistory(address: string, limit: number = 10) {
    const transfers = await this.gridClient.getTransfers(address, {
      limit,
      orderBy: 'created_at',
      status: 'completed',
    });
    return transfers.data;
  }

  async getSpendingLimits(address: string) {
    const limits = await this.gridClient.getSpendingLimits(address);
    return limits.data;
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