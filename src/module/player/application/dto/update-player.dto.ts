import { CreatePlayerDto } from '@module/player/application/dto/create-player.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdatePlayerDto extends PartialType(CreatePlayerDto) {}
