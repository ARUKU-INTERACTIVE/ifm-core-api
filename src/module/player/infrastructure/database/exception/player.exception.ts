import { BadRequestException } from '@nestjs/common';

export class PlayerAddressAlreadyExistsException extends BadRequestException {
  constructor() {
    super({ message: `Player address already exists` });
  }
}
