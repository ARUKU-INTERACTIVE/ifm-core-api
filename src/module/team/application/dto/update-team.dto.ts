import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { CreateTeamDto } from '@/module/team/application/dto/create-team.dto';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiProperty({ type: String, required: false, example: 'Barcelona' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, required: false, example: 'http://example.com' })
  @IsString()
  @IsOptional()
  logo?: string;
}
