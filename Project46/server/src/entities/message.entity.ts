import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MeetingRoom } from './meeting-room.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column({ nullable: true })
  roomId: string;

  @Column({ nullable: true })
  receiverId: string;

  @Column({ default: 'text' })
  type: 'text' | 'image' | 'file' | 'system' | 'emoji';

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => MeetingRoom)
  @JoinColumn({ name: 'roomId' })
  room: MeetingRoom;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}
