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

import { TransactionChallengeResponseDto } from '@iam/authentication/application/dto/transaction-challenge-response.dto';

import { STELLAR_NOT_FOUND_ERROR } from '@/stellar/application/constants/stellar-error-names.contants';
import { ErrorBuildingTransactionException } from '@/stellar/application/exceptions/error-building-transaction.exception';
import { IncorrectMemoException } from '@/stellar/application/exceptions/incorrect-memo.exception';
import { IncorrectSignException } from '@/stellar/application/exceptions/incorrect-sign.exception';
import { InvalidPublicKeyException } from '@/stellar/application/exceptions/invalid-public-key.exception';
import { STELLAR_ERROR } from '@/stellar/application/exceptions/stellar.error';

@Injectable()
export class StellarService {
  private readonly horizonUrl: string;
  private readonly networkPassphrase: string;
  private readonly server: Horizon.Server;

  constructor(private readonly configService: ConfigService) {
    this.horizonUrl = this.configService.get('stellar.serverUrl');
    this.networkPassphrase = this.configService.get(
      'stellar.networkPassphrase',
    );
    this.server = new Horizon.Server(this.horizonUrl);
  }

  async getTransactionChallenge(
    publicKey: string,
  ): Promise<TransactionChallengeResponseDto> {
    if (!StrKey.isValidEd25519PublicKey(publicKey)) {
      throw new InvalidPublicKeyException({
        message: STELLAR_ERROR.INVALID_PUBLIC_KEY,
      });
    }
    try {
      const account = await this.server.loadAccount(publicKey);
      const memo = Math.random().toString(36).substring(2);

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addMemo(Memo.text(memo))
        .setTimeout(30)
        .build();

      return {
        transactionXDR: transaction.toXDR(),
        memo,
      };
    } catch (error) {
      if (error.name === STELLAR_NOT_FOUND_ERROR) {
        throw new InvalidPublicKeyException({
          message: STELLAR_ERROR.ACCOUNT_NOT_FOUND,
        });
      }
      throw new ErrorBuildingTransactionException({
        message: STELLAR_ERROR.ERROR_BUILDING_TRANSACTION,
      });
    }
  }

  verifySignature(publicKey: string, signedXDR: string, memo: string): boolean {
    const transaction = TransactionBuilder.fromXDR(
      signedXDR,
      this.networkPassphrase,
    ) as Transaction<Memo<MemoType>, Operation[]>;
    if (!transaction.memo || transaction.memo.value.toString() !== memo) {
      throw new IncorrectMemoException({
        message: STELLAR_ERROR.INCORRECT_MEMO,
      });
    }

    if (
      !StrKey.isValidEd25519PublicKey(publicKey) ||
      !WebAuth.verifyTxSignedBy(transaction, publicKey)
    ) {
      throw new IncorrectSignException({
        message: STELLAR_ERROR.INCORRECT_SIGN,
      });
    }

    return true;
  }
}
