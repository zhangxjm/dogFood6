import { Controller, Get, Param, UseGuards, Req, Put, Body } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('api/users')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('online')
  getOnlineUsers() {
    return this.userService.getOnlineUsers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return { success: true, user: (req as any).user };
  }

  @Put('status')
  updateStatus(@Req() req: Request, @Body() body: { status: string }) {
    return this.userService.updateStatus((req as any).user.id, body.status as any);
  }

  @Put('position')
  updatePosition(@Req() req: Request, @Body() body: { x: number; y: number; z: number }) {
    return this.userService.updatePosition((req as any).user.id, body);
  }
}
