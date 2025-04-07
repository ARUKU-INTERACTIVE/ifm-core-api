import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNFTDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateNFTDtoWithFIle extends CreateNFTDto {
  file: Express.Multer.File;
}

export class CreateNFTDtoComplete extends CreateNFTDtoWithFIle {
  issuer: string;
  code: string;
}
