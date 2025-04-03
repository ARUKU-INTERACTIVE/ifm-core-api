import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';

export class TransactionMapper {
  fromXDRToTransactionDTO(xdr: string) {
    const transactionXDRDto = new TransactionXDRDTO();
    transactionXDRDto.xdr = xdr;
    return transactionXDRDto;
  }
}
