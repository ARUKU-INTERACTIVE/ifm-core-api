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
      address: jest.fn(),
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
const { ERROR_ACCOUNT, PK_ERROR } = loadAccountUseCases;

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
        return {
          balances: [
            {
              balance: '0.0000001',
              limit: '0.0000001',
              buying_liabilities: '0.0000000',
              selling_liabilities: '0.0000000',
              last_modified_ledger: 393875,
              is_authorized: true,
              is_authorized_to_maintain_liabilities: true,
              asset_type: 'credit_alphanum4',
              asset_code: 'NFT',
              asset_issuer: 'ISSUER',
            },
          ],
        };
      }),
      submitTransaction: jest.fn(),
    })),
  },
  Operation: {
    createAccount: jest.fn(),
    manageData: jest.fn(),
    changeTrust: jest.fn(),
    payment: jest.fn(),
    setOptions: jest.fn(),
    createStellarAssetContract: jest.fn(),
  },
  Memo: { text: jest.fn() },
  StrKey: {
    isValidEd25519PublicKey: jest.fn().mockImplementation((publicKey) => {
      if (publicKey == PK_ERROR) {
        throw new Error();
      }
      return true;
    }),
  },
  WebAuth: {
    verifyTxSignedBy: jest.fn().mockImplementation((transaction) => {
      if (transaction == ERROR) {
        throw new Error();
      }
      return true;
    }),
  },
  TransactionBuilder: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
    fromXDR: jest.fn(),
    addMemo: jest.fn().mockReturnThis(),
    setTimeout: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnThis(),
    addOperation: jest.fn().mockReturnThis(),
    toXDR: jest.fn().mockReturnValue(xdr),
  })),
  Asset: jest.fn().mockImplementation(() => ({
    code: 'code',
    issuer: 'issuer',
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
  Keypair: {
    random: jest.fn().mockImplementation(() => ({
      publicKey: jest.fn().mockReturnValue('GXX'),
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
    fromScAddress: jest.fn().mockReturnValue('CXX'),
  },
  xdr: {
    ScVal: {
      fromXDR: jest.fn().mockReturnValue('xdr'),
    },
  },
}));
