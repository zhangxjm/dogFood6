import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoomMember } from './room-member.entity';
import { Document } from './document.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: 'offline' })
  status: 'online' | 'offline' | 'busy' | 'away';

  @Column({ nullable: true, type: 'text' })
  position: string;

  @OneToMany(() => RoomMember, roomMember => roomMember.user)
  roomMembers: RoomMember[];

  @OneToMany(() => Document, document => document.creator)
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
