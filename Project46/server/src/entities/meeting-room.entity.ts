import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { RoomMember } from './room-member.entity';

@Entity('meeting_rooms')
export class MeetingRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'meeting' })
  type: 'meeting' | 'office' | 'lobby' | 'presentation';

  @Column({ default: 10 })
  maxCapacity: number;

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'private';

  @Column({ nullable: true, type: 'text' })
  sceneData: string;

  @OneToMany(() => RoomMember, roomMember => roomMember.room)
  members: RoomMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
