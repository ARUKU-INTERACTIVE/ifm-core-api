import { BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

import { IBaseErrorInfoParams } from '@common/base/application/interface/base-error.interface';

export class PlayerAddressAlreadyExistsException extends BadRequestException {
  constructor() {
    super({ message: 'Player address already exists' });
  }
}

export class PlayerNotOwnedByUserException extends HttpException {
  constructor() {
    super({ message: 'Player not owned by user' }, HttpStatus.FORBIDDEN);
  }
}

export class PlayerNotFoundException extends NotFoundException {
  constructor(params: IBaseErrorInfoParams) {
    super(params);
  }
}
