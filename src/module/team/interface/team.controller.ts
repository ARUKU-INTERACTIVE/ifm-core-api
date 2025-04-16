import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneRelationResponse } from '@common/base/application/dto/one-relation-response.interface.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { SortOptions } from '@common/base/application/interface/get-all-options.interface';
import { GetAllSwaggerDecorator } from '@common/base/application/interface/getAllSwaggerDecorator';
import { GetOneSwaggerDecorator } from '@common/base/application/interface/getOneSwaggerDecorator';

import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { Policy } from '@iam/authorization/infrastructure/policy/decorator/policy.decorator';
import { PolicyGuard } from '@iam/authorization/infrastructure/policy/guard/policy.guard';

import { CreateDto } from '@/module/team/application/dto/create-team.dto';
import { TeamFieldsQueryParamsDto } from '@/module/team/application/dto/query-param/team-fields-query-params.dto';
import { TeamFilterQueryParamsDto } from '@/module/team/application/dto/query-param/team-filter-query-params.dto';
import { IncludeQueryParamsDto } from '@/module/team/application/dto/team-include-query-params.dto';
import { TeamResponseDto } from '@/module/team/application/dto/team-response.dto';
import { UpdateDto } from '@/module/team/application/dto/update-team.dto';
import { TeamRelation } from '@/module/team/application/enum/team-relation.enum';
import { Service } from '@/module/team/application/service/team.service';
import { Team } from '@/module/team/domain/team.entity';
import { TEAM_ENTITY_NAME } from '@/module/team/domain/team.name';

@Controller('team')
@ControllerEntity(TEAM_ENTITY_NAME)
@UseGuards(PolicyGuard)
@ApiTags('team')
export class TeamController {
  constructor(private readonly service: Service) {}

  @Get()
  @Policy(AppAction.Read, Team)
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
    return this.service.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.fields,
    });
  }

  @Get(':id')
  @Policy(AppAction.Read, Team)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Get one Team by id or throw not found' })
  @GetOneSwaggerDecorator(TeamResponseDto)
  getOneByIdOrFail(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.service.getOneByIdOrFail(id);
  }

  @Post()
  @Policy(AppAction.Create, Team)
  @ApiOperation({ summary: 'Create new Team' })
  @ApiBody({ type: CreateDto })
  @GetOneSwaggerDecorator(TeamResponseDto)
  saveOne(
    @Body() createDto: CreateDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.service.saveOne(createDto);
  }

  @Patch(':id')
  @Policy(AppAction.Update, Team)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update one Team by id or throw not found',
  })
  @ApiBody({ type: UpdateDto })
  @GetOneSwaggerDecorator(TeamResponseDto)
  updateOneOrFail(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<OneSerializedResponseDto<TeamResponseDto>> {
    return this.service.updateOneOrFail(id, updateDto);
  }

  @Delete(':id')
  @Policy(AppAction.Delete, Team)
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Delete one Team by id or throw not found',
  })
  @ApiOkResponse({ status: 200 })
  deleteOneOrFail(@Param('id') id: number) {
    return this.service.deleteOneOrFail(id);
  }

  @Get('/:id/relationships/:name')
  @Policy(AppAction.Read, Team)
  async getOneRelation(
    @Param('id') id: number,
    @Param('name') relationName: TeamRelation | undefined,
  ): Promise<OneRelationResponse> {
    return this.service.getOneRelation(id, relationName);
  }
}
