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
  GET_PLAYER: {
    returnValue: {
      is_in_auction: false,
      issuer: 'Issuer',
      last_auction: null,
      name: 'player',
      owner: 'owner',
      id: 1,
      metadata_uri: 'http://example.com',
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
      _simulateTransaction: jest.fn().mockReturnValue({
        results: [
          {
            xdr: 'AAAAEQAAAAEAAAAFAAAADwAAAAZpc3N1ZXIAAAAAAA4AAAA4R0NFTVZVUzYyNVdURlVVMzJMWEU0Q1dTTk1DQjRHT01CTkw2Vk1FS01UM0RZSUlEWVg3NENHTDcAAAAPAAAADG1ldGFkYXRhX3VyaQAAAA4AAAALc29tZSBzdHJpbmcAAAAADwAAAARuYW1lAAAADgAAAARKb2VsAAAADwAAAAVvd25lcgAAAAAAAA4AAAA4R0M3MjRMVEhBN0ZGSVhPNFNDUExZSkdIS1AzVk1XNDNKQzNMRUFUSFBPTjVDTTQ3TkVFSjVUS0UAAAAPAAAACHRva2VuX2lkAAAACgAAAAAAAAAAAAAAAAAAAAE=',
          },
        ],
      }),
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
