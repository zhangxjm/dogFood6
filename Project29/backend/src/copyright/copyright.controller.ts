import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CopyrightService } from './copyright.service';

@Controller('api/copyrights')
export class CopyrightController {
  constructor(private readonly copyrightService: CopyrightService) {}

  @Post('register')
  @UseGuards(AuthGuard('jwt'))
  async register(@Request() req, @Body() body: { nftId: number; workName?: string; author?: string; copyrightHolder?: string; workType?: string; creationDate?: string }) {
    const copyright = await this.copyrightService.register(body.nftId, req.user.userId, body);
    return { success: true, data: copyright };
  }

  @Get()
  async findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '20') {
    const result = await this.copyrightService.findAll(parseInt(page), parseInt(limit));
    return { success: true, data: result.data, total: result.total };
  }

  @Get('verify/:registrationNumber')
  async verify(@Param('registrationNumber') registrationNumber: string) {
    const result = await this.copyrightService.verify(registrationNumber);
    return { success: true, data: result };
  }

  @Get('nft/:nftId')
  async findByNFT(@Param('nftId') nftId: string) {
    const copyrights = await this.copyrightService.findByNFT(parseInt(nftId));
    return { success: true, data: copyrights };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const copyright = await this.copyrightService.findOne(parseInt(id));
    return { success: true, data: copyright };
  }
}
