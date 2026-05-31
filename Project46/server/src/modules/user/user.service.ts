import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'username', 'nickname', 'avatar', 'status', 'createdAt'],
    });
  }

  async findOne(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'nickname', 'avatar', 'status', 'createdAt'],
    });
  }

  async updateStatus(userId: string, status: User['status']) {
    await this.userRepository.update(userId, { status });
  }

  async updatePosition(userId: string, position: { x: number; y: number; z: number }) {
    await this.userRepository.update(userId, { position: JSON.stringify(position) });
  }

  async getOnlineUsers() {
    return this.userRepository.find({
      where: { status: 'online' },
      select: ['id', 'username', 'nickname', 'avatar', 'status', 'position'],
    });
  }
}
