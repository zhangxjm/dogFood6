import { Module } from '@nestjs/common';
import { AvatarGateway } from './avatar.gateway';

@Module({
  providers: [AvatarGateway],
  exports: [AvatarGateway],
})
export class AvatarModule {}
