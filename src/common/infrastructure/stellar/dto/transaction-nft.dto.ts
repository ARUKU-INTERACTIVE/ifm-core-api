import { EntityName } from '@common/decorators/entity-name.decorator';
import { STELLAR_ENTITY_NAME } from '@common/infrastructure/stellar/domain/stellar.name';
import { IMintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.interface';
import { ITransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto.interface';

@EntityName(STELLAR_ENTITY_NAME)
export class TransactionNFTDto implements ITransactionNFTDto {
  mintPlayerTransactionsXDRDto: IMintPlayerTransactionsXDRDto;
  metadataCid: string;
  imageCid: string;
  issuer: string;
}
