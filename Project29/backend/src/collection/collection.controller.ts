import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CollectionService } from './collection.service';

@Controller('api/collections')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() body: any) {
    const collection = await this.collectionService.create(body);
    return { success: true, data: collection };
  }

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    const result = await this.collectionService.findAll(parseInt(page), parseInt(limit));
    return { success: true, data: result.data, total: result.total };
  }

  @Get('search')
  async search(@Query('q') query: string, @Query() filters: any) {
    const results = await this.collectionService.search(query, filters);
    return { success: true, data: results };
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.collectionService.getCategories();
    return { success: true, data: categories };
  }

  @Get('heritage-types')
  async getHeritageTypes() {
    const types = await this.collectionService.getHeritageTypes();
    return { success: true, data: types };
  }

  @Get('regions')
  async getRegions() {
    const regions = await this.collectionService.getRegions();
    return { success: true, data: regions };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const collection = await this.collectionService.findOne(parseInt(id));
    return { success: true, data: collection };
  }
}
