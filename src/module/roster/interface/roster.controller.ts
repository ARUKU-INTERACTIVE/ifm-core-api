import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { SortOptions } from '@common/base/application/interface/get-all-options.interface';
import { GetAllSwaggerDecorator } from '@common/base/application/interface/getAllSwaggerDecorator';
import { GetOneSwaggerDecorator } from '@common/base/application/interface/getOneSwaggerDecorator';

import { RosterFieldsQueryParamsDto } from '@/module/roster/application/dto/query-param/roster-fields-query-params.dto';
import { RosterFilterQueryParamsDto } from '@/module/roster/application/dto/query-param/roster-filter-query-params.dto';
import { IncludeQueryParamsDto } from '@/module/roster/application/dto/roster-include-query-params.dto';
import { RosterResponseDto } from '@/module/roster/application/dto/roster-response.dto';
import { RosterService } from '@/module/roster/application/service/roster.service';
import { ROSTER_ENTITY_NAME } from '@/module/roster/domain/roster.name';

@Controller('roster')
@ControllerEntity(ROSTER_ENTITY_NAME)
@ApiTags('roster')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Get()
  @GetAllSwaggerDecorator(
    RosterResponseDto,
    RosterFilterQueryParamsDto,
    RosterFieldsQueryParamsDto,
  )
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: RosterFilterQueryParamsDto,
    @Query('fields') fields: RosterFieldsQueryParamsDto,
    @Query('sort') sort: SortOptions<RosterResponseDto>,
    @Query('include') include: IncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<RosterResponseDto>> {
    return this.rosterService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.fields,
    });
  }

  @Get(':uuid')
  @ApiParam({ name: 'uuid', type: String })
  @ApiOperation({ summary: 'Get one Roster by id or throw not found' })
  @GetOneSwaggerDecorator(RosterResponseDto)
  getOneByUiidOrFail(
    @Param('uuid') uuid: string,
    @Query('include') include: IncludeQueryParamsDto,
  ): Promise<OneSerializedResponseDto<RosterResponseDto>> {
    return this.rosterService.getOneByUiidOrFail(uuid, include.fields);
  }
}
