import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService } from './transaction.service';

@Controller('api/transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('buy')
  @UseGuards(AuthGuard('jwt'))
  async buy(@Request() req, @Body() body: { nftId: number }) {
    const transaction = await this.transactionService.buyNFT(body.nftId, req.user.userId);
    return { success: true, data: transaction };
  }

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query() filters: any,
  ) {
    const result = await this.transactionService.findAll(parseInt(page), parseInt(limit), filters);
    return { success: true, data: result.data, total: result.total };
  }

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyTransactions(@Request() req) {
    const transactions = await this.transactionService.findByUser(req.user.userId);
    return { success: true, data: transactions };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.transactionService.getStats();
    return { success: true, data: stats };
  }
}
