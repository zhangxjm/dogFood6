import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Courseware } from '../courseware/courseware.entity';
import { Certificate } from '../certificate/certificate.entity';

export type CourseStatus = 'draft' | 'published' | 'ongoing' | 'completed';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  coverImage: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'int', default: 0 })
  duration: number;

  @Column({
    type: 'text',
    default: 'draft',
  })
  status: CourseStatus;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ type: 'int', default: 0 })
  maxStudents: number;

  @Column({ type: 'int', default: 0 })
  currentStudents: number;

  @ManyToOne(() => User, user => user.courses)
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @Column()
  teacherId: number;

  @OneToMany(() => Courseware, courseware => courseware.course)
  coursewares: Courseware[];

  @OneToMany(() => Certificate, certificate => certificate.course)
  certificates: Certificate[];

  @Column('simple-json', { nullable: true })
  customFields: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
