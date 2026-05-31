import { Controller, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursewareService } from './courseware.service';
import { Courseware } from './courseware.entity';

@Controller('coursewares')
export class CoursewareController {
  constructor(private readonly coursewareService: CoursewareService) {}

  @Get()
  async findAll(@Query('courseId') courseId?: number): Promise<Courseware[]> {
    return this.coursewareService.findAll(courseId);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Courseware> {
    return this.coursewareService.findOne(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { courseId: number; title?: string },
  ): Promise<Courseware> {
    return this.coursewareService.upload(body.courseId, file, body.title);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.coursewareService.delete(id);
  }
}
