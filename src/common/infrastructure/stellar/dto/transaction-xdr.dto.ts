import { IsString } from 'class-validator';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName('transaction_xdr')
export class TransactionXDRDTO {
  @IsString()
  xdr: string;
}
