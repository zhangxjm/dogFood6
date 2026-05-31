import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { Collection } from '../entities/collection.entity';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Module({
  imports: [TypeOrmModule.forFeature([Collection])],
  controllers: [CollectionController],
  providers: [CollectionService, ElasticsearchService],
})
export class CollectionModule {}
