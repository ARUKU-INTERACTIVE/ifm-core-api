import { BadRequestException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class UserNotRosterOwnerException extends BadRequestException {
  constructor(params?: IBaseErrorInfoParams) {
    super({
      ...params,
      message:
        'The user is not authorized to modify this roster because they are not the owner.',
    });
  }
}
