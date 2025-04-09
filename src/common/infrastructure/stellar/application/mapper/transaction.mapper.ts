import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';

export class TransactionMapper {
  fromXDRToTransactionDTO(xdr: string) {
    const transactionXDRDto = new TransactionXDRDTO();
    transactionXDRDto.xdr = xdr;
    return transactionXDRDto;
  }
  fromTransactionToTransactionNFTDto(
    xdr: string,
    metadataCid: string,
    imageCid: string,
    issuer: string,
  ) {
    const transactionXDRDto = new TransactionNFTDto();
    transactionXDRDto.xdr = xdr;
    transactionXDRDto.issuer = issuer;
    transactionXDRDto.imageCid = imageCid;
    transactionXDRDto.metadataCid = metadataCid;
    return transactionXDRDto;
  }
}
