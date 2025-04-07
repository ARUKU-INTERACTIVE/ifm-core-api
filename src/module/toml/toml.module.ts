import { PlayerModule } from '@module/player/player.module';
import { TomlService } from '@module/toml/application/service/toml.service';
import { TomlController } from '@module/toml/interface/toml.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [PlayerModule],
  providers: [TomlService],
  controllers: [TomlController],
  exports: [TomlService],
})
export class TomlModule {}
