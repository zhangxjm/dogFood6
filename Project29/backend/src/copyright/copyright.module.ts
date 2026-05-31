import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CopyrightController } from './copyright.controller';
import { CopyrightService } from './copyright.service';
import { Copyright } from '../entities/copyright.entity';
import { NFT } from '../entities/nft.entity';
import { User } from '../entities/user.entity';
import { BlockchainService } from '../services/blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Copyright, NFT, User])],
  controllers: [CopyrightController],
  providers: [CopyrightService, BlockchainService],
})
export class CopyrightModule {}
