import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MeetingRoomModule } from './modules/meeting-room/meeting-room.module';
import { DocumentModule } from './modules/document/document.module';
import { DesktopShareModule } from './modules/desktop-share/desktop-share.module';
import { AppGateway } from './gateways/app.gateway';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist'),
      exclude: ['/api*', '/socket.io*'],
    }),
    AuthModule,
    UserModule,
    MeetingRoomModule,
    DocumentModule,
    DesktopShareModule,
  ],
  providers: [AppGateway],
})
export class AppModule {}
