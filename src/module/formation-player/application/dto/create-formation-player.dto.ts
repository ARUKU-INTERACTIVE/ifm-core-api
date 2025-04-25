import {
  ICreateFormationPlayerDto,
  ICreateFormationPlayerUuidDto,
} from '@module/formation-player/application/dto/create-formation-player.dto.interface';
import { Position } from '@module/formation/application/enum/formation-position.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFormationPlayerDto implements ICreateFormationPlayerDto {
  @ApiProperty({ type: String, example: Position.Forward })
  @IsString()
  @IsNotEmpty()
  position: Position;
  @ApiProperty({ type: Number, example: 1 })
  @IsNumber()
  @IsNotEmpty()
  positionIndex: number;
}

export class CreateFormationPlayerUuidDto
  extends CreateFormationPlayerDto
  implements ICreateFormationPlayerUuidDto
{
  @ApiProperty({
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  playerUuid: string;
}
