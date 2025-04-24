import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PlayerFilterQueryParamsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metadataUri?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  issuer?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  externalId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  teamId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  rosterId?: number;
}
