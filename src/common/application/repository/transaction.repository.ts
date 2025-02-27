export const TRANSACTION_REPOSITORY_KEY = 'TRANSACTION_REPOSITORY_KEY';

export interface ITransactionRepository {
  getTransactionChallenge(publicKey: string);
  verifySignature(publicKey: string, signedXDR: string, nonce: string);
}
