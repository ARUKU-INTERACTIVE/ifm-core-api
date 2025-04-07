import { TomlService } from '@module/toml/application/service/toml.service';
import { Controller, Get, Header } from '@nestjs/common';

import { AuthType } from '@iam/authentication/domain/auth-type.enum';
import { Auth } from '@iam/authentication/infrastructure/decorator/auth.decorator';

@Auth(AuthType.None)
@Controller({ version: '', path: '.well-known' })
export class TomlController {
  constructor(private readonly tomlService: TomlService) {}

  @Get('/stellar.toml')
  @Header('Content-Type', 'text/plain')
  @Header('Content-Disposition', 'attachment; filename=stellar.toml')
  async getToml(): Promise<string> {
    return await this.tomlService.getToml();
  }
}
