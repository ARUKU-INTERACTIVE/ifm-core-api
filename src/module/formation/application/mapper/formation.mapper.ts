import { Injectable } from '@nestjs/common';

import { ICreateFormationDto } from '@/module/formation/application/dto/create-formation.dto.interface';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { Formation } from '@/module/formation/domain/formation.entity';

@Injectable()
export class FormationMapper {
  fromCreateFormationDtoToFormation(
    formationDto: ICreateFormationDto,
    rosterId: number,
  ): Formation {
    const formation = new Formation();
    formation.name = formationDto.name;
    formation.description = formationDto.description;
    formation.forwards = formationDto.forwards;
    formation.midfielders = formationDto.midfielders;
    formation.defenders = formationDto.defenders;
    formation.rosterId = rosterId;
    return formation;
  }

  fromFormationToFormationResponseDto(
    formation: Formation,
  ): FormationResponseDto {
    const formationResponseDto = new FormationResponseDto();
    formationResponseDto.id = formation.id;
    formationResponseDto.uuid = formation.uuid;
    formationResponseDto.name = formation.name;
    formationResponseDto.forwards = formation.forwards;
    formationResponseDto.midfielders = formation.midfielders;
    formationResponseDto.defenders = formation.defenders;
    formationResponseDto.createdAt = formation.createdAt;
    formationResponseDto.updatedAt = formation.updatedAt;
    formationResponseDto.deletedAt = formation.deletedAt;
    return formationResponseDto;
  }
}
