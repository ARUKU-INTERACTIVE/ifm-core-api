import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateFormationPlayerDto } from '@/module/formation-player/application/dto/create-formation-player.dto';

export class UpdateDto extends PartialType(CreateFormationPlayerDto) {
  @ApiProperty({ type: String, required: false, example: 'John' })
  @IsString()
  @IsOptional()
  name?: string;
}
