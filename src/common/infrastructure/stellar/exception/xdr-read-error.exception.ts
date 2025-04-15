import { InternalServerErrorException } from '@nestjs/common';

export class XDRReadErrorException extends InternalServerErrorException {
  constructor() {
    super({
      message: 'Could not read XDR: incorrect format or invalid data',
      error: 'XDR_READ_ERROR',
    });
  }
}
