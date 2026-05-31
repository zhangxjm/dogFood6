import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { DesktopShareService } from './desktop-share.service';
import { AuthGuard } from '../../guards/auth.guard';
import { DesktopShare } from '../../entities/desktop-share.entity';

@Controller('api/desktop-share')
@UseGuards(AuthGuard)
export class DesktopShareController {
  constructor(private readonly shareService: DesktopShareService) {}

  @Get()
  findAll(@Query('roomId') roomId: string) {
    return this.shareService.findAll(roomId);
  }

  @Get('active/:roomId')
  findActive(@Param('roomId') roomId: string) {
    return this.shareService.findActive(roomId);
  }

  @Post('start')
  startShare(
    @Req() req: Request,
    @Body() body: { roomId: string; streamId?: string; sourceType?: string; width?: number; height?: number },
  ) {
    return this.shareService.startShare((req as any).user.id, body.roomId, body as Partial<DesktopShare>);
  }

  @Put(':id/pause')
  pauseShare(@Param('id') id: string, @Req() req: Request) {
    return this.shareService.pauseShare(id, (req as any).user.id);
  }

  @Put(':id/resume')
  resumeShare(@Param('id') id: string, @Req() req: Request) {
    return this.shareService.resumeShare(id, (req as any).user.id);
  }

  @Put(':id/stop')
  stopShare(@Param('id') id: string, @Req() req: Request) {
    return this.shareService.stopShare(id, (req as any).user.id);
  }

  @Post('stop-by-room')
  stopShareByRoom(@Req() req: Request, @Body() body: { roomId: string }) {
    return this.shareService.stopShareByRoom(body.roomId, (req as any).user.id);
  }
}
