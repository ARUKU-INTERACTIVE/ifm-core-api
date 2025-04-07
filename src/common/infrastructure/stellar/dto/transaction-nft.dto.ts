import { EntityName } from '@common/decorators/entity-name.decorator';
import { STELLAR_ENTITY_NAME } from '@common/infrastructure/stellar/domain/stellar.name';
import { ITransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto.interface';

@EntityName(STELLAR_ENTITY_NAME)
export class TransactionNFTDto implements ITransactionNFTDto {
  xdr: string;
  metadataCid: string;
  imageCid: string;
  issuer: string;
}
