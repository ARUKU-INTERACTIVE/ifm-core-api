import { MintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.dto';
import { IMintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.interface';
import { TransactionNFTDto } from '@common/infrastructure/stellar/dto/transaction-nft.dto';
import { TransactionXDRDTO } from '@common/infrastructure/stellar/dto/transaction-xdr.dto';

export class TransactionMapper {
  fromXDRToTransactionDTO(xdr: string) {
    const transactionXDRDto = new TransactionXDRDTO();
    transactionXDRDto.xdr = xdr;
    return transactionXDRDto;
  }
  fromTransactionToTransactionNFTDto(
    mintPlayerTransactionsXDR: IMintPlayerTransactionsXDRDto,
    metadataCid: string,
    imageCid: string,
    issuer: string,
  ) {
    const transactionXDRDto = new TransactionNFTDto();
    transactionXDRDto.mintPlayerTransactionsXDRDto = mintPlayerTransactionsXDR;
    transactionXDRDto.issuer = issuer;
    transactionXDRDto.imageCid = imageCid;
    transactionXDRDto.metadataCid = metadataCid;
    return transactionXDRDto;
  }
  fromMintPlayerTransactionsToXDRDto(
    mintPlayerTransactionXDR: string,
    createStellarAssetContractXDR: string,
    disableMasterKeyTransactionXDR: string,
  ): MintPlayerTransactionsXDRDto {
    const mintPlayerTransactionsXDRDto = new MintPlayerTransactionsXDRDto();
    mintPlayerTransactionsXDRDto.createStellarAssetContractXDR =
      createStellarAssetContractXDR;
    mintPlayerTransactionsXDRDto.disableMasterKeyTransactionXDR =
      disableMasterKeyTransactionXDR;
    mintPlayerTransactionsXDRDto.mintPlayerTransactionXDR =
      mintPlayerTransactionXDR;
    return mintPlayerTransactionsXDRDto;
  }
}
