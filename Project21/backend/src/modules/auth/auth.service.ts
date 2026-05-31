import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = 'heritage-secret-key-2024';

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        email: user.email,
      },
    };
  }

  private generateToken(user: User): string {
    return jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      this.JWT_SECRET,
      { expiresIn: '7d' },
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.JWT_SECRET);
    } catch (e) {
      throw new UnauthorizedException('Token无效或已过期');
    }
  }
}
