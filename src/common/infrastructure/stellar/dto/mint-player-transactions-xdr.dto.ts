import { IsNotEmpty, IsString } from 'class-validator';

export class MintPlayerTransactionsXDRDto {
  @IsString()
  @IsNotEmpty()
  mintPlayerTransactionXDR: string;

  @IsString()
  @IsNotEmpty()
  createStellarAssetContractXDR: string;

  @IsString()
  @IsNotEmpty()
  disableMasterKeyTransactionXDR: string;
}
