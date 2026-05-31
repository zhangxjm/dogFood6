import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Course> {
    return this.courseRepository.findOne({
      where: { id },
      relations: ['teacher', 'coursewares'],
    });
  }

  async findByTeacher(teacherId: number): Promise<Course[]> {
    return this.courseRepository.find({
      where: { teacherId },
      relations: ['teacher'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(courseData: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    return this.courseRepository.save(course);
  }

  async update(id: number, courseData: Partial<Course>): Promise<Course> {
    await this.courseRepository.update(id, courseData);
    return this.courseRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.courseRepository.delete(id);
  }
}
