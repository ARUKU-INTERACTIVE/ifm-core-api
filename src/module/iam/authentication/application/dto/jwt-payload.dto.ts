export class JWTPayloadDto {
  publicKey: string;
  memo?: string;
  transactionSigned?: string;
}
