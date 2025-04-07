import { IPlayerDto } from '@module/player/application/dto/player.dto.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlayerDto implements IPlayerDto {
  @IsString()
  @IsNotEmpty()
  issuer: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  metadataCid: string;

  @IsString()
  @IsNotEmpty()
  imageCid: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;
}
