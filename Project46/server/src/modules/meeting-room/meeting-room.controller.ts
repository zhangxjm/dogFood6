import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { MeetingRoomService } from './meeting-room.service';
import { AuthGuard } from '../../guards/auth.guard';
import { MeetingRoom } from '../../entities/meeting-room.entity';

@Controller('api/rooms')
@UseGuards(AuthGuard)
export class MeetingRoomController {
  constructor(private readonly roomService: MeetingRoomService) {}

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<MeetingRoom>) {
    return this.roomService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<MeetingRoom>) {
    return this.roomService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }

  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Req() req: Request) {
    return this.roomService.joinRoom(id, (req as any).user.id);
  }

  @Post(':id/leave')
  leaveRoom(@Param('id') id: string, @Req() req: Request) {
    return this.roomService.leaveRoom(id, (req as any).user.id);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.roomService.getRoomMembers(id);
  }

  @Get(':id/messages')
  getMessages(@Param('id') id: string) {
    return this.roomService.getRoomMessages(id);
  }

  @Post(':id/messages')
  sendMessage(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: { content: string; type?: string },
  ) {
    return this.roomService.sendMessage(
      id,
      (req as any).user.id,
      body.content,
      (body.type as any) || 'text',
    );
  }
}
