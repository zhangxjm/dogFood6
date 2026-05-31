import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DesktopShare } from '../../entities/desktop-share.entity';

@Injectable()
export class DesktopShareService {
  constructor(
    @InjectRepository(DesktopShare)
    private shareRepository: Repository<DesktopShare>,
  ) {}

  async findAll(roomId?: string) {
    const where: any = {};
    if (roomId) {
      where.roomId = roomId;
    }
    return this.shareRepository.find({
      where,
      relations: ['sharer', 'room'],
      order: { startTime: 'DESC' },
    });
  }

  async findActive(roomId: string) {
    return this.shareRepository.findOne({
      where: { roomId, status: 'active' },
      relations: ['sharer', 'room'],
    });
  }

  async startShare(sharerId: string, roomId: string, data: Partial<DesktopShare>) {
    const active = await this.findActive(roomId);
    if (active && active.sharerId !== sharerId) {
      throw new BadRequestException('该会议室已有其他人正在共享桌面');
    }

    if (active && active.sharerId === sharerId) {
      return active;
    }

    const share = this.shareRepository.create({
      sharerId,
      roomId,
      status: 'active',
      streamId: data.streamId,
      sourceType: data.sourceType || 'screen',
      width: data.width,
      height: data.height,
    });

    return this.shareRepository.save(share);
  }

  async pauseShare(shareId: string, sharerId: string) {
    const share = await this.shareRepository.findOne({ where: { id: shareId } });
    if (!share) {
      throw new NotFoundException('共享不存在');
    }
    if (share.sharerId !== sharerId) {
      throw new BadRequestException('无权暂停此共享');
    }

    share.status = 'paused';
    return this.shareRepository.save(share);
  }

  async resumeShare(shareId: string, sharerId: string) {
    const share = await this.shareRepository.findOne({ where: { id: shareId } });
    if (!share) {
      throw new NotFoundException('共享不存在');
    }
    if (share.sharerId !== sharerId) {
      throw new BadRequestException('无权恢复此共享');
    }

    share.status = 'active';
    return this.shareRepository.save(share);
  }

  async stopShare(shareId: string, sharerId: string) {
    const share = await this.shareRepository.findOne({ where: { id: shareId } });
    if (!share) {
      throw new NotFoundException('共享不存在');
    }
    if (share.sharerId !== sharerId) {
      throw new BadRequestException('无权停止此共享');
    }

    share.status = 'ended';
    share.endTime = new Date();
    return this.shareRepository.save(share);
  }

  async stopShareByRoom(roomId: string, sharerId: string) {
    const active = await this.findActive(roomId);
    if (active && active.sharerId === sharerId) {
      return this.stopShare(active.id, sharerId);
    }
    return { success: true };
  }
}
