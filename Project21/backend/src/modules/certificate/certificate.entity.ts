import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Course } from '../course/course.entity';

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  certificateNumber: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.certificates)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Course, course => course.certificates)
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @Column()
  courseId: number;

  @Column()
  issueDate: Date;

  @Column({ nullable: true })
  validUntil: Date;

  @Column({ default: true })
  isValid: boolean;

  @Column({ nullable: true })
  certificateUrl: string;

  @Column('simple-json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
