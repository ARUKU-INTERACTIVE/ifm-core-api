import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class FormationFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rosterUuid?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rosterId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  forwards?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  midfielders?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  defenders?: number;
}
