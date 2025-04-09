import { IsNotEmpty, IsString } from 'class-validator';

import { EntityName } from '@common/decorators/entity-name.decorator';
import { STELLAR_ENTITY_NAME } from '@common/infrastructure/stellar/domain/stellar.name';

@EntityName(STELLAR_ENTITY_NAME)
export class TransactionXDRDTO {
  @IsString()
  @IsNotEmpty()
  xdr: string;
}
