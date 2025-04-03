import { ICreatePlayerDto } from '@module/player/application/dto/create-player.dto.interface';

export interface IPlayerDto extends ICreatePlayerDto {
  ownerId: number;
  issuer: string;
  externalId: number;
}
