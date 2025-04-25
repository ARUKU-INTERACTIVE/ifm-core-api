import { IUpdateFormationPlayerDto } from '@module/formation-player/application/dto/update-formation-player.dto.interface';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { CreateFormationPlayerDto } from '@/module/formation-player/application/dto/create-formation-player.dto';

export class UpdateFormationPlayerDto
  extends CreateFormationPlayerDto
  implements IUpdateFormationPlayerDto
{
  @ApiProperty({
    type: String,
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsString()
  @IsNotEmpty()
  playerFormationUuid: string;
}
