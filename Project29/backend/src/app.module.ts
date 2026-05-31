import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { NFTModule } from './nft/nft.module';
import { CollectionModule } from './collection/collection.module';
import { TransactionModule } from './transaction/transaction.module';
import { CopyrightModule } from './copyright/copyright.module';
import { SeedService } from './seed.service';
import { BlockchainService } from './services/blockchain.service';
import { User } from './entities/user.entity';
import { NFT } from './entities/nft.entity';
import { Collection } from './entities/collection.entity';
import { Transaction } from './entities/transaction.entity';
import { Copyright } from './entities/copyright.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      location: process.env.DB_PATH || './data/heritage.db',
      autoSave: true,
      entities: [User, NFT, Collection, Transaction, Copyright],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([User, Collection, NFT]),
    AuthModule,
    NFTModule,
    CollectionModule,
    TransactionModule,
    CopyrightModule,
  ],
  providers: [SeedService, BlockchainService],
})
export class AppModule {}
