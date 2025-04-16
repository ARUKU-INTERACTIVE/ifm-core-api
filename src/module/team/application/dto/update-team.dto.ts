import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateDto } from '@/module/team/application/dto/create-team.dto';

export class UpdateDto extends PartialType(CreateDto) {
  @ApiProperty({ type: String, required: false, example: 'John' })
  @IsString()
  @IsOptional()
  name?: string;
}
