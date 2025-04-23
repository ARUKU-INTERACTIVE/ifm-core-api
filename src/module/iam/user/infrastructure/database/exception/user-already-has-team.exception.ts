import { BadRequestException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class UserAlreadyHasTeamException extends BadRequestException {
  constructor(params?: IBaseErrorInfoParams) {
    super({ ...params, message: 'User already has a team' });
  }
}
