import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BoothService } from './booth.service';

@Controller('booths')
export class BoothController {
  constructor(private readonly boothService: BoothService) {}

  @Get()
  async findAll(@Query('exhibitionId') exhibitionId?: number) {
    if (exhibitionId) {
      return this.boothService.findByExhibition(exhibitionId);
    }
    return this.boothService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.boothService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.boothService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any) {
    return this.boothService.update(id, data);
  }

  @Put(':id/customize')
  async customize(@Param('id') id: number, @Body() data: any) {
    return this.boothService.customize(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.boothService.remove(id);
  }
}
