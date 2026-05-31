import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.token || request.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new UnauthorizedException('未登录');
    }

    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as any;
      request.user = decoded;
      return true;
    } catch (e) {
      throw new UnauthorizedException('登录已过期');
    }
  }
}
