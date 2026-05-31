import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../../entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { jwtConfig } from '../../config/jwt.config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({ where: { username: dto.username } });
    if (existing) {
      throw new BadRequestException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      password: hashedPassword,
      nickname: dto.nickname,
      avatar: this.generateAvatar(dto.nickname),
      status: 'offline',
    });

    await this.userRepository.save(user);
    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({ where: { username: dto.username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    user.status = 'online';
    await this.userRepository.save(user);

    return this.generateToken(user);
  }

  async logout(userId: string) {
    await this.userRepository.update(userId, { status: 'offline' });
  }

  private generateToken(user: User) {
    const payload = {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      avatar: user.avatar,
    };
    const token = jwt.sign(payload, jwtConfig.secret as jwt.Secret, { expiresIn: jwtConfig.expiresIn as jwt.SignOptions['expiresIn'] });
    return { token, user: payload };
  }

  private generateAvatar(name: string): string {
    const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    const initial = name.charAt(0).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="${colors[colorIndex]}"/><text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="white" font-size="32" font-family="Arial">${initial}</text></svg>`)}`;
  }
}
