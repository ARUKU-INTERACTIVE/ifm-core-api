import { Test, TestingModule } from '@nestjs/testing';
import { initializeTransactionalContext } from 'typeorm-transactional';

import {
  InvalidStellarTransactionError,
  StellarAccountNotFound,
} from '@common/infrastructure/stellar/exception/stellar.exception';
import { SorobanContractAdapter } from '@common/infrastructure/stellar/soroban-contract.adapter';
import { StellarAccountAdapter } from '@common/infrastructure/stellar/stellar-account.adapter';

import {
  IDENTITY_PROVIDER_SERVICE_KEY,
  IIdentityProviderService,
} from '@iam/authentication/application/service/identity-provider.service.interface';

import { AppModule } from '@/module/app/app.module';
import { StellarService } from '@/stellar/application/service/stellar.service';

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

export const testModuleBootstrapper = (): Promise<TestingModule> => {
  initializeTransactionalContext();

  return Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(IDENTITY_PROVIDER_SERVICE_KEY)
    .useValue(identityProviderServiceMock)
    .overrideProvider(StellarAccountAdapter)
    .useValue({
      createIssuerKeypair: jest.fn().mockReturnValue({
        publicKey: jest.fn(),
      }),
      getAccount: jest.fn().mockImplementation((publicKey) => {
        if (publicKey === 'ERROR') {
          throw new StellarAccountNotFound(publicKey);
        }
        return publicKey;
      }),
    })
    .overrideProvider(SorobanContractAdapter)
    .useValue({
      mintPlayer: jest.fn().mockImplementation((account) => {
        if (account === 'ERROR-ACCOUNT') {
          throw new InvalidStellarTransactionError();
        }
        return 'xdr';
      }),
    })
    .overrideProvider(StellarService)
    .useValue(stellarServiceMock)
    .compile();
};
