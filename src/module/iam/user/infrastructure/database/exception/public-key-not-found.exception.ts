import { NotFoundException } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

import { USERNAME_NOT_FOUND_ERROR } from '@iam/user/infrastructure/database/exception/user-exception-messages';

type Params = Omit<IBaseErrorInfoParams, 'message'> & { publicKey: string };
export class PublicKeyNotFoundException extends NotFoundException {
  constructor(params: Params) {
    const message = `${params.publicKey} ${USERNAME_NOT_FOUND_ERROR}`;
    super({ ...params, message });
  }
}
