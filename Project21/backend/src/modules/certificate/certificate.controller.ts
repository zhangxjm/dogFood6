import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CertificateService } from './certificate.service';
import { Certificate } from './certificate.entity';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Get()
  async findAll(@Query('userId') userId?: number): Promise<Certificate[]> {
    return this.certificateService.findAll(userId);
  }

  @Get('verify/:certificateNumber')
  async verify(@Param('certificateNumber') certificateNumber: string): Promise<Certificate | null> {
    return this.certificateService.verify(certificateNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Certificate> {
    return this.certificateService.findOne(id);
  }

  @Post()
  async create(@Body() data: {
    userId: number;
    courseId: number;
    title: string;
    content: string;
    validUntil?: Date;
  }): Promise<Certificate> {
    return this.certificateService.create(data);
  }

  @Put(':id/invalidate')
  async invalidate(@Param('id') id: number): Promise<Certificate> {
    return this.certificateService.invalidate(id);
  }
}
