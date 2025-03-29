import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';

import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
  StellarTransactionSubmissionError,
} from '@common/infrastructure/stellar/exception/stellar.exception';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';

import {
  IDENTITY_PROVIDER_SERVICE_KEY,
  IIdentityProviderService,
} from '@iam/authentication/application/service/identity-provider.service.interface';

import { AppModule } from '@/module/app/app.module';
import { StellarService } from '@/stellar/application/service/stellar.service';

jest.mock('@stellar/stellar-sdk', () => ({
  ...jest.requireActual('@stellar/stellar-sdk'),
  Horizon: {
    Server: jest.fn(),
  },
}));

export const identityProviderServiceMock: jest.MockedObject<IIdentityProviderService> =
  {
    signUp: jest.fn(),
    signIn: jest.fn(),
    confirmUser: jest.fn(),
    forgotPassword: jest.fn(),
    confirmPassword: jest.fn(),
    resendConfirmationCode: jest.fn(),
    refreshSession: jest.fn(),
  };

export const stellarServiceMock = {
  getTransactionChallenge: jest.fn(),
  verifySignature: jest.fn(),
};

export const stellarAccountAdapterMock = {
  createIssuerKeypair: jest.fn().mockReturnValue({
    publicKey: jest.fn(),
  }),
  getAccount: jest.fn().mockImplementation((publicKey) => {
    if (publicKey === 'ERROR') {
      throw new StellarAccountNotFound(publicKey);
    }
    return publicKey;
  }),
};

export const sorobanContractAdapterMock = {
  mintPlayer: jest.fn().mockImplementation((account) => {
    if (account === 'ERROR-ACCOUNT') {
      throw new InvalidStellarTransactionError();
    }
    return 'xdr';
  }),
  submitMintPlayer: jest.fn().mockImplementation((xdr) => {
    if (xdr === 'ERROR') {
      throw new StellarTransactionSubmissionError();
    }
    return 'xdr';
  }),
  getSorobanTransaction: jest.fn().mockReturnValue({
    name: 'Jonh Doe',
    issuer: 'Issuer',
    externalId: 1,
    metadataUri: 'http://example.com',
  }),
};

export const testModuleBootstrapper = (): Promise<TestingModule> => {
  initializeTransactionalContext();

  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(IDENTITY_PROVIDER_SERVICE_KEY)
    .useValue(identityProviderServiceMock)
    .overrideProvider(StellarAccountAdapter)
    .useValue(stellarAccountAdapterMock)
    .overrideProvider(SorobanContractAdapter)
    .useValue(sorobanContractAdapterMock)
    .overrideProvider(StellarService)
    .useValue(stellarServiceMock)
    .compile();
};
