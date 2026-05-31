import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { CoursewareModule } from './modules/courseware/courseware.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { LiveModule } from './modules/live/live.module';
import { DataSeedModule } from './modules/data-seed/data-seed.module';
import { MinioModule } from './modules/minio/minio.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './data/heritage.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    CourseModule,
    CoursewareModule,
    CertificateModule,
    LiveModule,
    DataSeedModule,
    MinioModule,
    AuthModule,
  ],
})
export class AppModule {}
