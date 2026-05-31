import { Module } from '@nestjs/common';
import { CoursewareService } from './courseware.service';
import { CoursewareController } from './courseware.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Courseware } from './courseware.entity';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Courseware]), MinioModule],
  providers: [CoursewareService],
  controllers: [CoursewareController],
  exports: [CoursewareService],
})
export class CoursewareModule {}
