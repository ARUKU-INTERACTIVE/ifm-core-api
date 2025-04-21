import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePlayerRosterDto {
  @IsNumber()
  @IsNotEmpty()
  playerId: number;
}
