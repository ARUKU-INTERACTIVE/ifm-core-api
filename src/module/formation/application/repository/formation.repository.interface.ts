import { ICollection } from '@common/base/application/dto/collection.interface';
import { IGetAllOptions } from '@common/base/application/interface/get-all-options.interface';

import { FormationRelation } from '@/module/formation/application/enum/formation-relation.enum';
import { Formation } from '@/module/formation/domain/formation.entity';

export const FORMATION_REPOSITORY_KEY = 'formation_repository';

export interface IFormationRepository {
  getAll(
    options?: IGetAllOptions<Formation, FormationRelation[]>,
  ): Promise<ICollection<Formation>>;
  getOneByIdOrFail(id: number): Promise<Formation>;
  getOneByUuidOrFail(uuid: string): Promise<Formation>;
  saveOne(formation: Formation): Promise<Formation>;
}
