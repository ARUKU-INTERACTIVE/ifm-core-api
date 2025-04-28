import { FormationPlayerMapper } from '@module/formation-player/application/mapper/formation-player.mapper';
import { IUpdateFormationDto } from '@module/formation/application/dto/update-formation.dto.interface';
import { Injectable } from '@nestjs/common';

import { ICreateFormationDto } from '@/module/formation/application/dto/create-formation.dto.interface';
import { FormationResponseDto } from '@/module/formation/application/dto/formation-response.dto';
import { Formation } from '@/module/formation/domain/formation.entity';

@Injectable()
export class FormationMapper {
  constructor(private readonly formationPlayerMapper: FormationPlayerMapper) {}
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
    formation.isActive = formationDto.isActive;
    formation.rosterId = rosterId;
    return formation;
  }

  fromUpdateFormationDtoToFormation(updateFormationDto: IUpdateFormationDto) {
    const formation = new Formation();
    formation.name = updateFormationDto.name;
    formation.description = updateFormationDto.description;
    formation.forwards = updateFormationDto.forwards;
    formation.midfielders = updateFormationDto.midfielders;
    formation.defenders = updateFormationDto.defenders;
    formation.isActive = updateFormationDto.isActive;
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
    formationResponseDto.isActive = formation.isActive;
    if (formation.formationPlayers) {
      formationResponseDto.formationPlayers = formation.formationPlayers.map(
        (formationPlayer) =>
          this.formationPlayerMapper.fromFormationPlayerToFormationPlayerResponseDto(
            formationPlayer,
          ),
      );
    }
    formationResponseDto.defenders = formation.defenders;
    formationResponseDto.createdAt = formation.createdAt;
    formationResponseDto.updatedAt = formation.updatedAt;
    formationResponseDto.deletedAt = formation.deletedAt;
    return formationResponseDto;
  }
}
