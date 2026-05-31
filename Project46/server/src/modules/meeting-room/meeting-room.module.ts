import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRoomController } from './meeting-room.controller';
import { MeetingRoomService } from './meeting-room.service';
import { MeetingRoom } from '../../entities/meeting-room.entity';
import { RoomMember } from '../../entities/room-member.entity';
import { Message } from '../../entities/message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingRoom, RoomMember, Message])],
  controllers: [MeetingRoomController],
  providers: [MeetingRoomService],
  exports: [MeetingRoomService],
})
export class MeetingRoomModule {}
