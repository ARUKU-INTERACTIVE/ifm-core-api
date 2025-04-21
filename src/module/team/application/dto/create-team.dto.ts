import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ICreateTeamDto } from '@/module/team/application/dto/create-team.dto.interface';

export class CreateTeamDto implements ICreateTeamDto {
  @ApiPropertyOptional({ type: String, example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String, example: 'http://example.com' })
  @IsString()
  @IsNotEmpty()
  logoUri: string;
}
