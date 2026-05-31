import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MeetingRoom } from './meeting-room.entity';

@Entity('room_members')
export class RoomMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  roomId: string;

  @Column({ default: 'member' })
  role: 'owner' | 'moderator' | 'member' | 'guest';

  @Column({ default: false })
  muted: boolean;

  @Column({ default: false })
  videoEnabled: boolean;

  @Column({ nullable: true, type: 'text' })
  position: string;

  @Column({ nullable: true, type: 'text' })
  rotation: string;

  @ManyToOne(() => User, user => user.roomMembers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => MeetingRoom, room => room.members)
  @JoinColumn({ name: 'roomId' })
  room: MeetingRoom;

  @CreateDateColumn()
  joinedAt: Date;
}
