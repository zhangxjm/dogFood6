import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Course } from '../course/course.entity';

export type CoursewareType = 'document' | 'video' | 'audio' | 'image' | 'other';

@Entity()
export class Courseware {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'text',
    default: 'document',
  })
  type: CoursewareType;

  @Column()
  fileName: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column()
  minioBucket: string;

  @Column()
  minioObject: string;

  @Column({ nullable: true })
  fileUrl: string;

  @ManyToOne(() => Course, course => course.coursewares)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
