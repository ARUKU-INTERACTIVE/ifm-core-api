import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ManySerializedResponseDto } from '@common/base/application/dto/many-serialized-response.dto';
import { OneSerializedResponseDto } from '@common/base/application/dto/one-serialized-response.dto';
import { PageQueryParamsDto } from '@common/base/application/dto/page-query-params.dto';
import { ControllerEntity } from '@common/base/application/interface/decorators/endpoint-entity.decorator';
import { SortOptions } from '@common/base/application/interface/get-all-options.interface';
import { GetAllSwaggerDecorator } from '@common/base/application/interface/getAllSwaggerDecorator';
import { GetOneSwaggerDecorator } from '@common/base/application/interface/getOneSwaggerDecorator';

import { CreateFormationDto } from '@/module/formation/application/dto/create-formation.dto';
import { IncludeQueryParamsDto } from '@/module/formation/application/dto/formation-include-query-params.dto';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { FormationFieldsQueryParamsDto } from '@/module/formation/application/dto/query-param/formation-fields-query-params.dto';
import { FormationFilterQueryParamsDto } from '@/module/formation/application/dto/query-param/formation-filter-query-params.dto';
import { FormationService } from '@/module/formation/application/service/formation.service';
import { FORMATION_ENTITY_NAME } from '@/module/formation/domain/formation.name';

@Controller('formation')
@ControllerEntity(FORMATION_ENTITY_NAME)
@ApiTags('formation')
export class FormationController {
  constructor(private readonly formationService: FormationService) {}

  @Get()
  @GetAllSwaggerDecorator(
    FormationResponseDto,
    FormationFilterQueryParamsDto,
    FormationFieldsQueryParamsDto,
  )
  getAll(
    @Query('page') page: PageQueryParamsDto,
    @Query('filter') filter: FormationFilterQueryParamsDto,
    @Query('fields') fields: FormationFieldsQueryParamsDto,
    @Query('sort') sort: SortOptions<FormationResponseDto>,
    @Query('include') include: IncludeQueryParamsDto,
  ): Promise<ManySerializedResponseDto<FormationResponseDto>> {
    return this.formationService.getAll({
      page,
      filter,
      sort,
      fields: fields.target,
      include: include.fields,
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOperation({ summary: 'Get one Formation by id or throw not found' })
  @GetOneSwaggerDecorator(FormationResponseDto)
  getOneByIdOrFail(
    @Param('id') id: number,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    return this.formationService.getOneByIdOrFail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new Formation' })
  @ApiBody({ type: CreateFormationDto })
  @GetOneSwaggerDecorator(FormationResponseDto)
  saveOne(
    @Body() createFormationDto: CreateFormationDto,
  ): Promise<OneSerializedResponseDto<FormationResponseDto>> {
    console.log(createFormationDto, 'createFormationDto');
    return this.formationService.saveOne(createFormationDto);
  }
}
