import { Module } from '@nestjs/common';

import { PinataAdapter } from '@common/infrastructure/ipfs/pinata.adapter';

@Module({
  providers: [PinataAdapter],
  exports: [PinataAdapter],
})
export class PinataModule {}
