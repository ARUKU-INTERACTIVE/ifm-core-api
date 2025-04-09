import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';

import { CreateNFTDto } from '@common/infrastructure/stellar/dto/create-nft.dto';
import { MintPlayerTransactionsXDRDto } from '@common/infrastructure/stellar/dto/mint-player-transactions-xdr.dto';

export class SubmitMintPlayerDto extends CreateNFTDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => MintPlayerTransactionsXDRDto)
  mintPlayerTransactionsXDRDto: MintPlayerTransactionsXDRDto;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  metadataCid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  imageCid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  issuer: string;
}
