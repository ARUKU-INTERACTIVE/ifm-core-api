import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { SortOptions } from '@common/base/application/interface/get-all-options.interface';
import { GetAllSwaggerDecorator } from '@common/base/application/interface/getAllSwaggerDecorator';
import { GetOneSwaggerDecorator } from '@common/base/application/interface/getOneSwaggerDecorator';

import { CurrentUser } from '@iam/authentication/infrastructure/decorator/current-user.decorator';
import { User } from '@iam/user/domain/user.entity';

import { CreateTeamDto } from '@/module/team/application/dto/create-team.dto';
import { TeamFieldsQueryParamsDto } from '@/module/team/application/dto/query-param/team-fields-query-params.dto';
import { TeamFilterQueryParamsDto } from '@/module/team/application/dto/query-param/team-filter-query-params.dto';
import { IncludeQueryParamsDto } from '@/module/team/application/dto/team-include-query-params.dto';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { UpdateTeamDto } from '@/module/team/application/dto/update-team.dto';
import { TeamService } from '@/module/team/application/service/team.service';
import { TEAM_ENTITY_NAME } from '@/module/team/domain/team.name';

@Controller('team')
@ControllerEntity(TEAM_ENTITY_NAME)
@ApiTags('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @GetAllSwaggerDecorator(
    TeamResponseDto,
    TeamFilterQueryParamsDto,
    TeamFieldsQueryParamsDto,
  )
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: TeamFilterQueryParamsDto,
    @Query('fields') fields: TeamFieldsQueryParamsDto,
    @Query('sort') sort: SortOptions<TeamResponseDto>,
    @Query('include') include: IncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<TeamResponseDto>> {
    return this.teamService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.fields,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Get one Team by id or throw not found' })
  @GetOneSwaggerDecorator(TeamResponseDto)
  getOneByIdOrFail(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.teamService.getOneByIdOrFail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Team' })
  @ApiBody({ type: CreateTeamDto })
  @GetOneSwaggerDecorator(TeamResponseDto)
  saveOne(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() currentUser: User,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.teamService.saveOne(createTeamDto, currentUser);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update one Team by id or throw not found',
  })
  @ApiBody({ type: UpdateTeamDto })
  @GetOneSwaggerDecorator(TeamResponseDto)
  updateOneOrFail(
    @Param('id') id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.teamService.updateOneOrFail(id, updateTeamDto);
  }
}
