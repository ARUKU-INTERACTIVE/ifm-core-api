import { ConflictException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

interface IRosterCapacityExceededParams extends IBaseErrorInfoParams {
  maxPlayers: number;
}

export class RosterCapacityExceeded extends ConflictException {
  constructor(params: IRosterCapacityExceededParams) {
    super({
      ...params,
      message: `The roster already has the maximum of ${params.maxPlayers} players.`,
    });
  }
}
