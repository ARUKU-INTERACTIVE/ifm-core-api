import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlayerRosterDto {
  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsString()
  @IsNotEmpty()
  rosterId: string;
}
