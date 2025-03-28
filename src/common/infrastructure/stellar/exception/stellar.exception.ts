import { HttpException, HttpStatus } from '@nestjs/common';

export class StellarAccountNotFound extends HttpException {
  constructor(publicKey: string) {
    super(
      `Stellar account with public key ${publicKey} was not found`,
      HttpStatus.NOT_FOUND,
    );
  }
}
export class InvalidStellarTransactionError extends HttpException {
  constructor() {
    super(
      'An error occurred during transaction creation',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class StellarTransactionSubmissionError extends HttpException {
  constructor() {
    super(
      'Failed to submit the transaction to Stellar',
      HttpStatus.BAD_REQUEST,
    );
  }
}
