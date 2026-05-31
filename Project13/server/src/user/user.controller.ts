import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.userService.create(data);
  }

  @Post('login')
  async login(@Body() data: { username: string }) {
    return this.userService.login(data.username);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any) {
    return this.userService.update(id, data);
  }

  @Put(':id/avatar')
  async updateAvatar(@Param('id') id: number, @Body() data: any) {
    return this.userService.updateAvatar(id, data);
  }

  @Get(':id/nfts')
  async getUserNfts(@Param('id') id: number) {
    return this.userService.getUserNfts(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.userService.remove(id);
  }
}
