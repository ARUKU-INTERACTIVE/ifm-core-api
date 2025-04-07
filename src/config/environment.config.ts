import { ENVIRONMENT } from '@config/environment.enum';

export const environmentConfig = () => ({
  server: {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_APP_URL,
  },
  cognito: {
    clientId: process.env.COGNITO_CLIENT_ID,
    issuer: process.env.COGNITO_ISSUER,
    endpoint: process.env.COGNITO_ENDPOINT,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
  },
  environment: {
    name: process.env.NODE_ENV,
  },
  stellar: {
    serverUrl: process.env.STELLAR_SERVER_URL,
    networkPassphrase:
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? process.env.STELLAR_LOCAL_NETWORK_PASSPHRASE
        : process.env.STELLAR_NETWORK_PASSPHRASE,
    homeDomain: process.env.HOME_DOMAIN,
    codeMint: process.env.STELLAR_CODE_MINT,
  },
  soroban: {
    serverUrl:
      process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS
        ? process.env.SOROBAN_LOCAL_SERVER_URL
        : process.env.SOROBAN_SERVER_URL,
    contractAddress: process.env.SOROBAN_CONTRACT_ADDRESS,
  },
  pinata: {
    pinataJwt: process.env.PINATA_JWT,
    pinataGatewayUrl: process.env.PINATA_GATEWAY_URL,
  },
});
