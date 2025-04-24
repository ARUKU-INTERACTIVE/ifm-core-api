import { IsDate, IsInt, IsOptional, IsString } from 'class-validator';

import { DtoProperty } from '@common/base/application/dto/base.dto';
import { EntityName } from '@common/decorators/entity-name.decorator';

import { TEAM_ENTITY_NAME } from '@/module/team/domain/team.name';

@EntityName(TEAM_ENTITY_NAME)
export class TeamResponseDto {
  @DtoProperty
  @IsInt()
  id: number;

  @DtoProperty
  @IsString()
  @IsOptional()
  uuid?: string;

  @DtoProperty
  @IsString()
  name: string;

  @DtoProperty
  @IsString()
  logoUri: string;

  @DtoProperty
  @IsString()
  rosterId: string;

  @DtoProperty
  @IsDate()
  createdAt: string;

  @DtoProperty
  @IsDate()
  updatedAt: string;

  @DtoProperty
  @IsDate()
  @IsOptional()
  deletedAt?: string;
}
