import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom } from '../../entities/meeting-room.entity';
import { RoomMember } from '../../entities/room-member.entity';
import { Message } from '../../entities/message.entity';

@Injectable()
export class MeetingRoomService {
  constructor(
    @InjectRepository(MeetingRoom)
    private roomRepository: Repository<MeetingRoom>,
    @InjectRepository(RoomMember)
    private roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async findAll() {
    return this.roomRepository.find({
      relations: ['members', 'members.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const room = await this.roomRepository.findOne({
      where: { id },
      relations: ['members', 'members.user'],
    });
    if (!room) {
      throw new NotFoundException('会议室不存在');
    }
    return room;
  }

  async create(data: Partial<MeetingRoom>) {
    const room = this.roomRepository.create(data);
    return this.roomRepository.save(room);
  }

  async update(id: string, data: Partial<MeetingRoom>) {
    await this.roomRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.roomMemberRepository.delete({ roomId: id });
    await this.messageRepository.delete({ roomId: id });
    await this.roomRepository.delete(id);
    return { success: true };
  }

  async joinRoom(roomId: string, userId: string, role: RoomMember['role'] = 'member') {
    const room = await this.findOne(roomId);
    if (room.members.length >= room.maxCapacity) {
      throw new BadRequestException('会议室已满');
    }

    const existing = await this.roomMemberRepository.findOne({ where: { roomId, userId } });
    if (existing) {
      return existing;
    }

    const member = this.roomMemberRepository.create({
      roomId,
      userId,
      role,
      position: JSON.stringify({ x: 0, y: 0, z: 0 }),
      rotation: JSON.stringify({ x: 0, y: 0, z: 0 }),
    });

    return this.roomMemberRepository.save(member);
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.roomMemberRepository.delete({ roomId, userId });
    return { success: true };
  }

  async updateMemberPosition(roomId: string, userId: string, position: any, rotation: any) {
    await this.roomMemberRepository.update(
      { roomId, userId },
      {
        position: JSON.stringify(position),
        rotation: JSON.stringify(rotation),
      },
    );
    return { success: true };
  }

  async getRoomMembers(roomId: string) {
    return this.roomMemberRepository.find({
      where: { roomId },
      relations: ['user'],
    });
  }

  async sendMessage(roomId: string, senderId: string, content: string, type: Message['type'] = 'text') {
    const message = this.messageRepository.create({
      roomId,
      senderId,
      content,
      type,
    });
    const saved = await this.messageRepository.save(message);
    return this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    });
  }

  async getRoomMessages(roomId: string, limit = 50) {
    return this.messageRepository.find({
      where: { roomId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
