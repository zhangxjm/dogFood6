import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NftService } from './nft.service';

@Controller('nfts')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get()
  async findAll(@Query('boothId') boothId?: number) {
    if (boothId) {
      return this.nftService.findByBooth(boothId);
    }
    return this.nftService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.nftService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.nftService.create(data);
  }

  @Post('mint')
  async mint(@Body() data: { userId: number; nftId: number }) {
    return this.nftService.mint(data.userId, data.nftId);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() data: any) {
    return this.nftService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.nftService.remove(id);
  }
}
