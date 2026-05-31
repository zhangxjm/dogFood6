import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Courseware } from './courseware.entity';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class CoursewareService {
  constructor(
    @InjectRepository(Courseware)
    private coursewareRepository: Repository<Courseware>,
    private minioService: MinioService,
  ) {}

  async findAll(courseId?: number): Promise<Courseware[]> {
    const where = courseId ? { courseId } : {};
    return this.coursewareRepository.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Courseware> {
    return this.coursewareRepository.findOne({ where: { id } });
  }

  async upload(courseId: number, file: Express.Multer.File, title?: string): Promise<Courseware> {
    const objectName = `${courseId}/${uuidv4()}-${file.originalname}`;
    const { url } = await this.minioService.uploadFile(objectName, file);

    const type = this.getFileType(file.mimetype);

    const courseware = this.coursewareRepository.create({
      title: title || file.originalname,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      type,
      minioBucket: this.minioService.getBucketName(),
      minioObject: objectName,
      fileUrl: url,
      courseId,
    });

    return this.coursewareRepository.save(courseware);
  }

  async delete(id: number): Promise<void> {
    const courseware = await this.findOne(id);
    if (courseware) {
      await this.minioService.deleteFile(courseware.minioObject);
      await this.coursewareRepository.delete(id);
    }
  }

  private getFileType(mimeType: string): Courseware['type'] {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('sheet')) {
      return 'document';
    }
    return 'other';
  }
}
