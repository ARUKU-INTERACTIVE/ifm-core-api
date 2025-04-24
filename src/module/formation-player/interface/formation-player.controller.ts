import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

import {
  CreateFormationPlayerDto,
  CreateFormationPlayerUuidDto,
} from '@/module/formation-player/application/dto/create-formation-player.dto';
import { IncludeQueryParamsDto } from '@/module/formation-player/application/dto/formation-player-include-query-params.dto';
import { ResponseDto } from '@/module/formation-player/application/dto/formation-player-response.dto';
import { FormationPlayerFieldsQueryParamsDto } from '@/module/formation-player/application/dto/query-param/formation-player-fields-query-params.dto';
import { FormationPlayerFilterQueryParamsDto } from '@/module/formation-player/application/dto/query-param/formation-player-filter-query-params.dto';
import { UpdateDto } from '@/module/formation-player/application/dto/update-formation-player.dto';
import { FormationPlayerRelation } from '@/module/formation-player/application/enum/formation-player-relation.enum';
import { FormationPlayerService } from '@/module/formation-player/application/service/formation-player.service';
import { FORMATION_PLAYER_ENTITY_NAME } from '@/module/formation-player/domain/formation-player.name';

@Controller('formation-player')
@ControllerEntity(FORMATION_PLAYER_ENTITY_NAME)
@ApiTags('formation-player')
export class FormationPlayerController {
  constructor(private readonly service: FormationPlayerService) {}

  @Get()
  @GetAllSwaggerDecorator(
    ResponseDto,
    FormationPlayerFilterQueryParamsDto,
    FormationPlayerFieldsQueryParamsDto,
  )
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: FormationPlayerFilterQueryParamsDto,
    @Query('fields') fields: FormationPlayerFieldsQueryParamsDto,
    @Query('sort') sort: SortOptions<ResponseDto>,
    @Query('include') include: IncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<ResponseDto>> {
    return this.service.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.fields,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Get one FormationPlayer by id or throw not found' })
  @GetOneSwaggerDecorator(ResponseDto)
  getOneByIdOrFail(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    return this.service.getOneByIdOrFail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new FormationPlayer' })
  @ApiBody({ type: CreateFormationPlayerDto })
  @GetOneSwaggerDecorator(ResponseDto)
  saveOne(
    @Body() createDto: CreateFormationPlayerUuidDto,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    return this.service.saveOne(createDto);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Update one FormationPlayer by id or throw not found',
  })
  @ApiBody({ type: UpdateDto })
  @GetOneSwaggerDecorator(ResponseDto)
  updateOneOrFail(
    @Param('id') id: number,
    @Body() updateDto: UpdateDto,
  ): Promise<OneSerializedResponseDto<ResponseDto>> {
    return this.service.updateOneOrFail(id, updateDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({
    summary: 'Delete one FormationPlayer by id or throw not found',
  })
  @ApiOkResponse({ status: 200 })
  deleteOneOrFail(@Param('id') id: number) {
    return this.service.deleteOneOrFail(id);
  }

  @Get('/:id/relationships/:name')
  async getOneRelation(
    @Param('id') id: number,
    @Param('name') relationName: FormationPlayerRelation | undefined,
  ): Promise<OneRelationResponse> {
    return this.service.getOneRelation(id, relationName);
  }
}
