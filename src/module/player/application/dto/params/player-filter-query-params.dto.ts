import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

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
  @IsNumber()
  @IsOptional()
  ownerId?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  issuer?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  externalId?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isInAuction?: boolean;
}
