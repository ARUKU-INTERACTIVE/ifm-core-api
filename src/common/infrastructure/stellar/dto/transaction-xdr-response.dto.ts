import { IsString } from 'class-validator';

export class TransactionXDRResponseDto {
  @IsString()
  xdr: string;
}
