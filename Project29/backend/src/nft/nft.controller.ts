import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Put } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NFTService } from './nft.service';

@Controller('api/nfts')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}

  @Post('mint')
  @UseGuards(AuthGuard('jwt'))
  async mint(@Request() req, @Body() body: { collectionId: number; price: number; name?: string; description?: string }) {
    const nft = await this.nftService.mintNFT(
      body.collectionId,
      req.user.userId,
      body.price,
      body.name,
      body.description,
    );
    return { success: true, data: nft };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query() filters: any,
  ) {
    const result = await this.nftService.findAll(parseInt(page), parseInt(limit), filters);
    return { success: true, data: result.data, total: result.total };
  }

  @Get('search')
  async search(@Query('q') query: string, @Query() filters: any) {
    const results = await this.nftService.search(query, filters);
    return { success: true, data: results };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.nftService.getStats();
    return { success: true, data: stats };
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyNFTs(@Request() req) {
    const nfts = await this.nftService.findByOwner(req.user.userId);
    return { success: true, data: nfts };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const nft = await this.nftService.findOne(parseInt(id));
    return { success: true, data: nft };
  }

  @Put(':id/price')
  @UseGuards(AuthGuard('jwt'))
  async updatePrice(@Request() req, @Param('id') id: string, @Body() body: { price: number }) {
    const nft = await this.nftService.updatePrice(parseInt(id), req.user.userId, body.price);
    return { success: true, data: nft };
  }
}
