import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FeeBumpTransaction,
  Keypair,
  Memo,
  MemoType,
  Operation,
  Transaction,
  TransactionBuilder,
  rpc,
} from '@stellar/stellar-sdk';

import { UnknownErrorException } from '@common/infrastructure/exception/unknow-error.exception';
import { TRANSACTION_STATUS } from '@common/infrastructure/stellar/enum/transaction-status.enum';
import { TransactionTimeoutException } from '@common/infrastructure/stellar/exception/transaction-timeout-error.exception';
import { UnknownErrorSubmittingTransaction } from '@common/infrastructure/stellar/exception/unknown-error-submitting-transaction';
import { UnknownStatusException } from '@common/infrastructure/stellar/exception/unknown-status-error.exception';
import { IGetSorobanTransactionResponse } from '@common/infrastructure/stellar/interface/get-soroban-transaction-response.interface';

@Injectable()
export class StellarTransactionAdapter {
  private readonly sorobanServer: rpc.Server;
  private readonly networkPassphrase: string;

  constructor(private readonly environmentConfig: ConfigService) {
    const serverUrl = this.environmentConfig.get('stellar.serverUrl');
    const sorobanServerUrl = this.environmentConfig.get('soroban.serverUrl');
    this.networkPassphrase = this.environmentConfig.get(
      'stellar.networkPassphrase',
    );
    this.sorobanServer = new rpc.Server(sorobanServerUrl, { allowHttp: true });
  }

  buildTransactionFromXdr(
    xdr: string,
  ): Transaction<Memo<MemoType>, Operation[]> | FeeBumpTransaction {
    return TransactionBuilder.fromXDR(xdr, this.networkPassphrase);
  }
  async prepareTransaction(xdr: string): Promise<string> {
    try {
      const transaction = this.buildTransactionFromXdr(xdr);
      const uploadTransaction =
        await this.sorobanServer.prepareTransaction(transaction);

      return uploadTransaction.toXDR();
    } catch (err) {
      throw new UnknownErrorException({
        message: 'Failed to prepare transaction',
      });
    }
  }

  async getSorobanTransaction(
    hash: string,
  ): Promise<IGetSorobanTransactionResponse> {
    try {
      const TIMEOUT = 1000;
      const MAX_RETRIES = 10;
      let count = 0;
      let transaction: rpc.Api.GetTransactionResponse;

      do {
        if (count > MAX_RETRIES) {
          throw new TransactionTimeoutException({
            message:
              'Transaction timeout error when getting transaction details',
          });
        }

        transaction = await this.sorobanServer.getTransaction(hash);

        count++;
        await new Promise((resolve) => setTimeout(resolve, TIMEOUT));
      } while (
        this.mapTransactionStatus(transaction.status) ===
        TRANSACTION_STATUS.NOT_FOUND
      );

      return transaction as unknown as IGetSorobanTransactionResponse;
    } catch (error) {
      if (error instanceof TransactionTimeoutException) {
        throw error;
      }
      throw new UnknownErrorException({
        message: 'Failed to get transaction details',
      });
    }
  }

  async submitSorobanTransaction(
    xdr: string,
  ): Promise<rpc.Api.GetTransactionResponse> {
    const transaction = this.buildTransactionFromXdr(xdr);
    const POLLING_SLEEP_TIME_MS = 500;
    const POLLING_ATTEMPTS = 15;

    const pollingOptions: rpc.Server.PollingOptions = {
      sleepStrategy: () => POLLING_SLEEP_TIME_MS,
      attempts: POLLING_ATTEMPTS,
    };
    try {
      const initialResponse =
        await this.sorobanServer.sendTransaction(transaction);

      if (initialResponse.status !== TRANSACTION_STATUS.PENDING) {
        throw initialResponse;
      }

      const finalResponse = await this.sorobanServer.pollTransaction(
        initialResponse.hash,
        pollingOptions,
      );

      return this.handleTransactionStatus(finalResponse);
    } catch (error) {
      if (
        error instanceof UnknownErrorSubmittingTransaction ||
        error instanceof UnknownStatusException
      ) {
        throw error;
      }
      throw new UnknownErrorException({
        message: 'Failed to submit transaction to Soroban',
      });
    }
  }

  private handleTransactionStatus(
    response: rpc.Api.GetTransactionResponse,
  ): rpc.Api.GetTransactionResponse {
    const status = this.mapTransactionStatus(response.status);

    if (status !== TRANSACTION_STATUS.SUCCESS) {
      throw new UnknownErrorSubmittingTransaction({
        message: 'Failed to submit transaction to Soroban',
      });
    } else {
      return response;
    }
  }

  private mapTransactionStatus(
    status: rpc.Api.GetTransactionStatus,
  ): TRANSACTION_STATUS {
    switch (status) {
      case rpc.Api.GetTransactionStatus.SUCCESS:
        return TRANSACTION_STATUS.SUCCESS;
      case rpc.Api.GetTransactionStatus.NOT_FOUND:
        return TRANSACTION_STATUS.NOT_FOUND;
      case rpc.Api.GetTransactionStatus.FAILED:
        return TRANSACTION_STATUS.FAILED;
      default:
        throw new UnknownStatusException({
          message: 'Transaction status not recognized',
        });
    }
  }
}
