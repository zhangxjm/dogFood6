import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ExhibitionModule } from './exhibition/exhibition.module';
import { BoothModule } from './booth/booth.module';
import { UserModule } from './user/user.module';
import { NftModule } from './nft/nft.module';
import { AvatarModule } from './avatar/avatar.module';
import { WebrtcModule } from './webrtc/webrtc.module';

@Module({
  imports: [
    DatabaseModule,
    ExhibitionModule,
    BoothModule,
    UserModule,
    NftModule,
    AvatarModule,
    WebrtcModule,
  ],
})
export class AppModule {}
