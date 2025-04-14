import { BadRequestException } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';

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
