import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName = process.env.MINIO_BUCKET || 'heritage-courseware';

  async onModuleInit() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });

    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (e) {
      console.log('MinIO bucket init:', e.message);
    }
  }

  async uploadFile(objectName: string, file: Express.Multer.File): Promise<{ url: string; etag: string }> {
    const metaData = {
      'Content-Type': file.mimetype,
    };

    const result = await this.minioClient.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      metaData,
    );

    const url = await this.getFileUrl(objectName);
    return { url, etag: result.etag };
  }

  async getFileUrl(objectName: string): Promise<string> {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    return `http://${endpoint === 'minio' ? 'localhost' : endpoint}:${port}/${this.bucketName}/${objectName}`;
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, objectName);
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
