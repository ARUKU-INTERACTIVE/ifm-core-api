import { IPlayerDto } from '@module/player/application/dto/player.dto.interface';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PlayerDto implements IPlayerDto {
  @IsNumber()
  @IsNotEmpty()
  externalId: number;

  @IsString()
  @IsNotEmpty()
  issuer: string;

  @IsString()
  @IsNotEmpty()
  metadataUri: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  ownerId: number;
}
