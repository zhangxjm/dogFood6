import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../entities/collection.entity';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async create(data: any): Promise<Collection> {
    const collection = this.collectionRepository.create(data);
    const saved = await this.collectionRepository.save(collection) as unknown as Collection;
    await this.elasticsearchService.indexCollection(saved);
    return saved;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: Collection[]; total: number }> {
    const [data, total] = await this.collectionRepository.findAndCount({
      where: { isActive: true },
      relations: ['nfts'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
      relations: ['nfts', 'nfts.owner'],
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  async search(query: string, filters: any = {}): Promise<any[]> {
    const esResults = await this.elasticsearchService.searchCollections(query, filters);
    if (esResults.length > 0) {
      return esResults;
    }

    return this.collectionRepository
      .createQueryBuilder('collection')
      .where('collection.name LIKE :query OR collection.description LIKE :query OR collection.artist LIKE :query', {
        query: `%${query}%`,
      })
      .getMany();
  }

  async getCategories(): Promise<string[]> {
    const collections = await this.collectionRepository.find({ select: ['category'] }) as Partial<Collection>[];
    const categories = [...new Set(collections.map(c => c.category))];
    return categories.filter((c): c is string => !!c);
  }

  async getHeritageTypes(): Promise<string[]> {
    const collections = await this.collectionRepository.find({ select: ['heritageType'] }) as Partial<Collection>[];
    const types = [...new Set(collections.map(c => c.heritageType))];
    return types.filter((t): t is string => !!t);
  }

  async getRegions(): Promise<string[]> {
    const collections = await this.collectionRepository.find({ select: ['region'] }) as Partial<Collection>[];
    const regions = [...new Set(collections.map(c => c.region))];
    return regions.filter((r): r is string => !!r);
  }
}
