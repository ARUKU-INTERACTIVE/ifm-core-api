import { IsNotEmpty, IsString } from 'class-validator';

export class SignInWithTransactionDto {
  @IsString()
  @IsNotEmpty()
  transactionSigned: string;

  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  memo: string;
}
