import { Controller, Get, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { ExhibitionService } from './exhibition.service';

@Controller('exhibitions')
export class ExhibitionController {
  constructor(private readonly exhibitionService: ExhibitionService) {}

  @Get()
  async findAll() {
    return this.exhibitionService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.exhibitionService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.exhibitionService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any) {
    return this.exhibitionService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.exhibitionService.remove(id);
  }
}
