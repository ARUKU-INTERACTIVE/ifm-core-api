import { IRefreshSessionResponse } from '@iam/authentication/application/dto/refresh-session-response.interface';
import { ISignInResponse } from '@iam/authentication/application/dto/sign-in-response.interface';

export const IDENTITY_PROVIDER_SERVICE_KEY = 'identity_provider_service';

export interface IIdentityProviderService {
  signIn(username: string, password: string): Promise<ISignInResponse>;
  refreshSession(
    username: string,
    refreshToken: string,
  ): Promise<IRefreshSessionResponse>;
}
