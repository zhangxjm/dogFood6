import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from '../entities/transaction.entity';
import { NFT } from '../entities/nft.entity';
import { User } from '../entities/user.entity';
import { BlockchainService } from '../services/blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, NFT, User])],
  controllers: [TransactionController],
  providers: [TransactionService, BlockchainService],
})
export class TransactionModule {}
