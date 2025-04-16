import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { ICreateDto } from '@/module/team/application/dto/create-team.dto.interface';

export class CreateDto implements ICreateDto {
  @ApiPropertyOptional({ type: String, example: 'John' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ type: String, example: 'http://example.com' })
  @IsString()
  @IsNotEmpty()
  logoUri: string;
}
