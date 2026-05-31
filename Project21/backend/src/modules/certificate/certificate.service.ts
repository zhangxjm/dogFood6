import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Certificate } from './certificate.entity';

@Injectable()
export class CertificateService {
  constructor(
    @InjectRepository(Certificate)
    private certificateRepository: Repository<Certificate>,
  ) {}

  async findAll(userId?: number): Promise<Certificate[]> {
    const where = userId ? { userId } : {};
    return this.certificateRepository.find({
      where,
      relations: ['user', 'course'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Certificate> {
    return this.certificateRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });
  }

  async create(data: {
    userId: number;
    courseId: number;
    title: string;
    content: string;
    validUntil?: Date;
  }): Promise<Certificate> {
    const certificateNumber = `CERT-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;
    
    const certificate = this.certificateRepository.create({
      ...data,
      certificateNumber,
      issueDate: new Date(),
      isValid: true,
    });

    return this.certificateRepository.save(certificate);
  }

  async verify(certificateNumber: string): Promise<Certificate | null> {
    return this.certificateRepository.findOne({
      where: { certificateNumber, isValid: true },
      relations: ['user', 'course'],
    });
  }

  async invalidate(id: number): Promise<Certificate> {
    await this.certificateRepository.update(id, { isValid: false });
    return this.certificateRepository.findOne({ where: { id } });
  }
}
