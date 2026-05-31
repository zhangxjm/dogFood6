import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { MeetingRoom } from './meeting-room.entity';

@Entity('desktop_shares')
export class DesktopShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sharerId: string;

  @Column()
  roomId: string;

  @Column({ default: 'active' })
  status: 'active' | 'paused' | 'ended';

  @Column({ nullable: true })
  streamId: string;

  @Column({ default: 'screen' })
  sourceType: 'screen' | 'window' | 'tab';

  @Column({ nullable: true, type: 'integer' })
  width: number;

  @Column({ nullable: true, type: 'integer' })
  height: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sharerId' })
  sharer: User;

  @ManyToOne(() => MeetingRoom)
  @JoinColumn({ name: 'roomId' })
  room: MeetingRoom;

  @CreateDateColumn()
  startTime: Date;

  @Column({ nullable: true })
  endTime: Date;
}
