import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFT } from '../entities/nft.entity';
import { Collection } from '../entities/collection.entity';
import { User } from '../entities/user.entity';
import { BlockchainService } from '../services/blockchain.service';
import { ElasticsearchService } from '../services/elasticsearch.service';

@Injectable()
export class NFTService {
  constructor(
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private blockchainService: BlockchainService,
    private elasticsearchService: ElasticsearchService,
  ) {}

  async mintNFT(collectionId: number, userId: number, price: number, name?: string, description?: string): Promise<NFT> {
    const collection = await this.collectionRepository.findOne({ where: { id: collectionId } });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const metadata = {
      name: name || collection.name,
      description: description || collection.description,
      image: collection.image,
      collection: collection.name,
      category: collection.category,
      heritageType: collection.heritageType,
      region: collection.region,
      artist: collection.artist,
    };

    const { tokenId, transactionHash, blockNumber } = await this.blockchainService.mintNFT(metadata);

    const nft = this.nftRepository.create({
      tokenId,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      price,
      status: 'available',
      metadataUri: `ipfs://heritage/${tokenId}`,
      tokenUri: `ipfs://heritage/${tokenId}`,
      royaltyFee: 5,
      blockchain: 'HeritageChain',
      transactionHash,
      blockNumber,
      owner: user,
      collection,
    });

    const savedNft = await this.nftRepository.save(nft) as unknown as NFT;
    await this.elasticsearchService.indexNFT(savedNft);

    return savedNft;
  }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ data: NFT[]; total: number }> {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.collection = { category: filters.category };

    const [data, total] = await this.nftRepository.findAndCount({
      where,
      relations: ['owner', 'collection', 'copyrights'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<NFT> {
    const nft = await this.nftRepository.findOne({
      where: { id },
      relations: ['owner', 'collection', 'copyrights', 'transactions', 'transactions.seller', 'transactions.buyer'],
    });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }
    return nft;
  }

  async findByOwner(ownerId: number): Promise<NFT[]> {
    return this.nftRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['collection', 'copyrights'],
      order: { createdAt: 'DESC' },
    });
  }

  async search(query: string, filters: any = {}): Promise<any[]> {
    const esResults = await this.elasticsearchService.searchNFTs(query, filters);
    if (esResults.length > 0) {
      return esResults;
    }

    const nfts = await this.nftRepository
      .createQueryBuilder('nft')
      .leftJoinAndSelect('nft.collection', 'collection')
      .where('nft.name LIKE :query OR nft.description LIKE :query', { query: `%${query}%` })
      .getMany();

    return nfts;
  }

  async updatePrice(id: number, userId: number, price: number): Promise<NFT> {
    const nft = await this.findOne(id);
    if (!nft.owner || nft.owner.id !== userId) {
      throw new BadRequestException('You are not the owner of this NFT');
    }

    nft.price = price;
    nft.status = price > 0 ? 'available' : 'not_for_sale';
    return this.nftRepository.save(nft) as Promise<NFT>;
  }

  async getStats(): Promise<any> {
    const totalNFTs = await this.nftRepository.count();
    const totalListed = await this.nftRepository.count({ where: { status: 'available' } });
    const totalVolume = await this.nftRepository
      .createQueryBuilder('nft')
      .select('SUM(nft.price)', 'total')
      .where('nft.status = :status', { status: 'sold' })
      .getRawOne();

    return {
      totalNFTs,
      totalListed,
      totalVolume: totalVolume?.total || 0,
      chainLength: this.blockchainService.getChainLength(),
    };
  }
}
