import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
} from '@common/infrastructure/stellar/exception/stellar.exception';

export const loadAccountUseCases = {
  PK_ERROR: 'PK-ERROR',
  ERROR_ACCOUNT: 'ERROR-ACCOUNT',
  DEFAULT: 'PK',
};

const SubmitStatus = {
  SUCCESS: 'SUCCESS',
  PENDING: 'PENDING',
};

export const getTransactionResponse = {
  MINT_PLAYER: {
    returnValue: {
      name: 'Jonh Doe',
      issuer: 'Issuer',
      externalId: 1,
      metadataUri: 'http://example.com',
    },
  },
};

const transactionXDR = {
  xdr: 'xdr',
};

export const transactionUseCases = {
  ERROR: 'ERROR',
};

const { ERROR } = transactionUseCases;
const { SUCCESS, PENDING } = SubmitStatus;
const { xdr } = transactionXDR;
const { DEFAULT, ERROR_ACCOUNT, PK_ERROR } = loadAccountUseCases;

jest.mock('@stellar/stellar-sdk', () => ({
  ...jest.requireActual('@stellar/stellar-sdk'),
  Horizon: {
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: jest.fn().mockImplementation((publicKey: string) => {
        if (publicKey == PK_ERROR) {
          throw new StellarAccountNotFound(publicKey);
        } else if (publicKey == ERROR_ACCOUNT) {
          throw new InvalidStellarTransactionError();
        }
        return DEFAULT;
      }),
    })),
  },
  TransactionBuilder: jest.fn().mockImplementation(() => ({
    fromXDR: jest.fn(),
    addMemo: jest.fn(),
    setTimeout: jest.fn(),
    build: jest.fn(),
    addOperation: jest.fn().mockImplementation(() => ({
      setTimeout: jest.fn().mockImplementation(() => ({
        build: jest.fn().mockImplementation(() => ({
          toXDR: jest.fn(),
        })),
      })),
    })),
  })),
  rpc: {
    Api: {
      GetTransactionStatus: {
        SUCCESS,
      },
    },
    Server: jest.fn().mockImplementation(() => ({
      prepareTransaction: jest.fn().mockImplementation(() => ({
        toXDR: jest.fn().mockReturnValue(xdr),
      })),
      getTransaction: jest.fn().mockReturnValue({
        ...getTransactionResponse.MINT_PLAYER,
        status: SUCCESS,
      }),
      sendTransaction: jest.fn().mockImplementation((transaction) => {
        if (transaction == ERROR) {
          throw new Error();
        }
        return { status: PENDING };
      }),
      pollTransaction: jest
        .fn()
        .mockReturnValue({ status: SUCCESS, txHash: xdr }),
    })),
  },
  WebAuth: {
    verifyTxSignedBy: jest.fn(),
  },
  StrKey: {
    isValidEd25519PublicKey: jest.fn(),
  },
  Keypair: {
    random: jest.fn().mockImplementation(() => ({
      publicKey: jest.fn(),
    })),
    fromSecret: jest.fn(),
  },
  nativeToScVal: jest.fn(),
  scValToNative: jest.fn(),
  Contract: jest.fn().mockImplementation(() => ({
    call: jest.fn(),
  })),
  Address: {
    fromString: jest.fn(),
  },
}));
