import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
} from '@common/infrastructure/stellar/exception/stellar.exception';

jest.mock('@stellar/stellar-sdk', () => ({
  ...jest.requireActual('@stellar/stellar-sdk'),
  Horizon: {
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: jest.fn().mockImplementation((publicKey: string) => {
        if (publicKey == 'PK-ERROR') {
          throw new StellarAccountNotFound(publicKey);
        } else if (publicKey == 'ERROR-ACCOUNT') {
          throw new InvalidStellarTransactionError();
        }
        return 'PK';
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
        SUCCESS: 'SUCCESS',
      },
    },
    Server: jest.fn().mockImplementation(() => ({
      prepareTransaction: jest.fn().mockImplementation(() => ({
        toXDR: jest.fn().mockReturnValue('xdr'),
      })),
      getTransaction: jest.fn().mockReturnValue({
        returnValue: {
          name: 'Jonh Doe',
          issuer: 'Issuer',
          externalId: 1,
          metadataUri: 'http://example.com',
        },
        status: 'SUCCESS',
      }),
      sendTransaction: jest.fn().mockImplementation((transaction) => {
        if (transaction == 'ERROR') {
          throw new Error();
        }
        return { status: 'PENDING' };
      }),
      pollTransaction: jest
        .fn()
        .mockReturnValue({ status: 'SUCCESS', txHash: 'xdr' }),
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
