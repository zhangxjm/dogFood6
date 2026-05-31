import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTController } from './nft.controller';
import { NFTService } from './nft.service';
import { NFT } from '../entities/nft.entity';
import { Collection } from '../entities/collection.entity';
import { User } from '../entities/user.entity';
import { Copyright } from '../entities/copyright.entity';
import { BlockchainService } from '../services/blockchain.service';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([NFT, Collection, User, Copyright])],
  controllers: [NFTController],
  providers: [NFTService, BlockchainService, ElasticsearchService],
})
export class NFTModule {}
