import { PLAYER_ENTITY_NAME } from '@module/player/domain/player.name';
import { ApiProperty } from '@nestjs/swagger';

import { EntityName } from '@common/decorators/entity-name.decorator';

@EntityName(PLAYER_ENTITY_NAME)
export class PlayerResponseUpdateDto {
  @ApiProperty()
  updatedCount: number;

  @ApiProperty()
  deletedCount: number;
}
