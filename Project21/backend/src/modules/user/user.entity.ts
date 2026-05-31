import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Course } from '../course/course.entity';
import { Certificate } from '../certificate/certificate.entity';

export type UserRole = 'admin' | 'teacher' | 'student';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'text',
    default: 'student',
  })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @OneToMany(() => Course, course => course.teacher)
  courses: Course[];

  @OneToMany(() => Certificate, certificate => certificate.user)
  certificates: Certificate[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
