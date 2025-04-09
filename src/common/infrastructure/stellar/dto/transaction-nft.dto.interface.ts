import { IMintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.interface';

export interface ITransactionNFTDto {
  mintPlayerTransactionsXDRDto: IMintPlayerTransactionsXDRDto;
  metadataCid: string;
  imageCid: string;
  issuer: string;
}
