import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string }) {
    const user = await this.authService.register(body.username, body.email, body.password);
    const { password, ...result } = user;
    return { success: true, data: result };
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const result = await this.authService.login(body.username, body.password);
    return { success: true, data: result };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    const user = await this.authService.findById(req.user.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user;
    return { success: true, data: result };
  }
}
