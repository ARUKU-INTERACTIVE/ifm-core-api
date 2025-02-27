import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BASE_FEE,
  Horizon,
  Memo,
  MemoType,
  Operation,
  StrKey,
  Transaction,
  TransactionBuilder,
  WebAuth,
} from '@stellar/stellar-sdk';

import { STELLAR_ERROR } from '@common/application/exceptions/stellar.error';
import { ITransactionRepository } from '@common/application/repository/transaction.repository';

@Injectable()
export class StellarService implements ITransactionRepository {
  private readonly horizonUrl: string;
  private readonly networkPassphrase: string;

  constructor(private readonly configService: ConfigService) {
    this.horizonUrl = this.configService.get('stellar.serverUrl');
    this.networkPassphrase = this.configService.get(
      'stellar.networkPassphrase',
    );
  }

  async getTransactionChallenge(publicKey: string) {
    const server = new Horizon.Server(this.horizonUrl);

    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      throw new Error(STELLAR_ERROR.INVALID_PUBLIC_KEY);
    }

    const account = await server.loadAccount(publicKey);
    const nonce = Math.random().toString(36).substring(2);

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.networkPassphrase,
    })
      .addMemo(Memo.text(nonce))
      .setTimeout(30)
      .build();

    return {
      transactionXDR: transaction.toXDR(),
      nonce,
    };
  }

  async verifySignature(publicKey: string, signedXDR: string, nonce: string) {
    const transaction = TransactionBuilder.fromXDR(
      signedXDR,
      this.networkPassphrase,
    ) as Transaction<Memo<MemoType>, Operation[]>;

    if (!transaction.memo || transaction.memo.value.toString() !== nonce) {
      throw new Error(STELLAR_ERROR.INCORRECT_NONCE);
    }

    if (
      !StrKey.isValidEd25519PublicKey(publicKey) ||
      !WebAuth.verifyTxSignedBy(transaction, publicKey)
    ) {
      throw new Error(STELLAR_ERROR.INCORRECT_SIGN);
    }
  }
}
