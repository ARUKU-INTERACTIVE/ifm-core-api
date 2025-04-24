import { ConflictException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

interface IPlayerAlreadyInRosterParams extends IBaseErrorInfoParams {
  playerUuid: string;
  rosterUuid: string;
}

export class PlayerAlreadyInRoster extends ConflictException {
  constructor(params: IPlayerAlreadyInRosterParams) {
    super({
      ...params,
      message: `Player with uuid ${params.playerUuid} is already assigned to roster uuid ${params.rosterUuid}`,
    });
  }
}
