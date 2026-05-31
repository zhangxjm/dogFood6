import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DesktopShareController } from './desktop-share.controller';
import { DesktopShareService } from './desktop-share.service';
import { DesktopShare } from '../../entities/desktop-share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DesktopShare])],
  controllers: [DesktopShareController],
  providers: [DesktopShareService],
  exports: [DesktopShareService],
})
export class DesktopShareModule {}
