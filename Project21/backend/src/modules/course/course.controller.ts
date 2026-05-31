import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from './course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get()
  async findAll(@Query('teacherId') teacherId?: number): Promise<Course[]> {
    if (teacherId) {
      return this.courseService.findByTeacher(teacherId);
    }
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Course> {
    return this.courseService.findOne(id);
  }

  @Post()
  async create(@Body() courseData: Partial<Course>): Promise<Course> {
    const { teacher, coursewares, certificates, ...data } = courseData as any;
    return this.courseService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() courseData: Partial<Course>): Promise<Course> {
    const { teacher, coursewares, certificates, ...data } = courseData as any;
    return this.courseService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.courseService.remove(id);
  }
}
