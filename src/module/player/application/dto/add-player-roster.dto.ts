import { IsNotEmpty, IsString } from 'class-validator';

export class AddPlayerToRosterDto {
  @IsString()
  @IsNotEmpty()
  playerUuid: string;

  @IsString()
  @IsNotEmpty()
  rosterUuid: string;
}
