import { CreateFormationPlayerUuidDto } from '@module/formation-player/application/dto/create-formation-player.dto';
import { UpdateFormationPlayerDto } from '@module/formation-player/application/dto/update-formation-player.dto';
import { IUpdateFormationDto } from '@module/formation/application/dto/update-formation.dto.interface';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateFormationDto implements IUpdateFormationDto {
  @ApiPropertyOptional({ type: String, example: 'Attack' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: String,
    example: 'That formation is for going on the offensive.',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    type: String,
    example: '',
  })
  @IsString()
  @IsNotEmpty()
  formationUuid: string;

  @ApiPropertyOptional({ type: Number, example: 3 })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  forwards: number;

  @ApiPropertyOptional({ type: Number, example: 3 })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  midfielders: number;

  @ApiPropertyOptional({ type: Number, example: 4 })
  @IsNumber()
  @IsOptional()
  @IsNotEmpty()
  defenders: number;

  @ApiPropertyOptional({ type: Array })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFormationPlayerDto)
  formationPlayers: UpdateFormationPlayerDto[];

  @ApiPropertyOptional({ type: Array })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateFormationPlayerUuidDto)
  newFormationPlayers: CreateFormationPlayerUuidDto[];
}
