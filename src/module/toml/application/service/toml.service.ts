import { PlayerResponseDto } from '@module/player/application/dto/player-response.dto';
import { PlayerService } from '@module/player/application/service/player.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TomlService {
  private readonly homeDomain: string;
  private readonly codeMint: string;
  constructor(
    private readonly playerService: PlayerService,
    private readonly environmentConfig: ConfigService,
  ) {
    this.homeDomain = this.environmentConfig.get<string>('stellar.homeDomain');
    this.codeMint = this.environmentConfig.get<string>('stellar.codeMint');
  }
  private getNftTemplate(player: Partial<PlayerResponseDto>): string {
    return `
   [[CURRENCIES]]
   code=${this.codeMint}
   issuer=${player.issuer}
   display_decimals=7
   name=${player.name}
   desc=${player.description}
   image=${player.imageUri}
   `;
  }

  async getToml(): Promise<string> {
    const players = await this.playerService.getAll({
      page: { size: 0, offset: 0, number: 0 },
    });
    const template = players.data.map((player) => {
      return this.getNftTemplate({
        name: player.attributes.name,
        issuer: player.attributes.issuer,
        description: player.attributes.description,
        imageUri: player.attributes.imageUri,
      });
    });
    const tomlContent = `
   [DOCUMENTATION]
   
   ORG_URL="https://${this.homeDomain}"
      `.concat(template.join('\n\n'));

    return tomlContent;
  }
}
