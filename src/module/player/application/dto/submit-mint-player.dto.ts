import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateNFTDto } from '@common/infrastructure/stellar/dto/create-nft.dto';

export class SubmitMintPlayerDto extends CreateNFTDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  xdr: string;

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
