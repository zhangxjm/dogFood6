import { Controller, Get, Query, Param } from '@nestjs/common';
import { queryAll, queryOne } from './database';

@Controller('services')
export class ServicesController {
  @Get()
  findAll(@Query('category') category?: string) {
    if (category && category !== 'all') {
      return queryAll('SELECT * FROM services WHERE category = ? AND status = ?', [category, 'active']);
    }
    return queryAll('SELECT * FROM services WHERE status = ?', ['active']);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return queryOne('SELECT * FROM services WHERE id = ?', [Number(id)]);
  }
}
