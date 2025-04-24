[Back To Index](/README.md)

## Environment Variables

#### Application

| Variable       | Description            |
| -------------- | ---------------------- |
| `PORT`         | Nest application port. |
| `NODE_ENV`     | Current environment.   |
| `BASE_APP_URL` | API base url.          |
| `FRONTEND_URL` | UI base url.           |
| `HOME_DOMAIN`  | NFT home domain.       |

#### Database

| Variable      | Description        |
| ------------- | ------------------ |
| `DB_HOST`     | Database hostname. |
| `DB_PORT`     | Database port.     |
| `DB_USERNAME` | Database username. |
| `DB_PASSWORD` | Database password. |
| `DB_NAME`     | Database name.     |
| `DB_SCHEMA`   | Database schema.   |

#### Auth

| Variable                     | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `API_KEY`                    | Api key to allow the frontend to communicate with API. |
| `AUTH_ALLOWED_EMAIL_DOMAINS` | Allowed email domains.                                 |

#### Stellar Local

| Variable                           | Description                       |
| ---------------------------------- | --------------------------------- |
| `STELLAR_LOCAL_SERVER`             | Stellar local server.             |
| `STELLAR_LOCAL_NETWORK_PASSPHRASE` | Stellar local network passphrase. |

#### Stellar

| Variable                     | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| `STELLAR_SERVER`             | Stellar Server, can be pubnet, testnet or futurenet. |
| `STELLAR_NETWORK_PASSPHRASE` | Stellar Server network passphrase.                   |
| `STELLAR_ADMIN`              | Soroban Contract admin.                              |
| `STELLAR_DEFAULT_ASSET_CODE` | Default asset code.                                  |
| `NATIVE_ASSET_ADDRESS`       | Native asset (XLM) asset address.                    |

#### Soroban

| Variable                   | Description               |
| -------------------------- | ------------------------- |
| `SOROBAN_SERVER_URL`       | Soroban server url.       |
| `SOROBAN_CONTRACT_ADDRESS` | Smart contract address.   |
| `SOROBAN_LOCAL_SERVER_URL` | Soroban local server url. |

#### IPFS ( Pinata )

| Variable             | Description         |
| -------------------- | ------------------- |
| `PINATA_JWT`         | Pinata api key.     |
| `PINATA_GATEWAY_URL` | Pinata gateway url. |
