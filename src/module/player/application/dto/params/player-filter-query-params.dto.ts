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
  metadataUri?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  issuer?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  externalId?: number;
}
