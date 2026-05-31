import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Collection } from './entities/collection.entity';
import { NFT } from './entities/nft.entity';
import { BlockchainService } from './services/blockchain.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    private blockchainService: BlockchainService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    try {
      const userCount = await this.userRepository.count();
      if (userCount > 0) {
        this.logger.log('Database already seeded, skipping...');
        return;
      }

      this.logger.log('Starting database seeding...');

      const hashedPassword = await bcrypt.hash('123456', 10);

      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@heritage.com',
        password: hashedPassword,
        walletAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        balance: 100000,
        role: 'admin',
      });
      await this.userRepository.save(admin) as unknown as User;

      const user1 = this.userRepository.create({
        username: '收藏家',
        email: 'user1@heritage.com',
        password: hashedPassword,
        walletAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
        balance: 50000,
        role: 'user',
      });
      await this.userRepository.save(user1) as unknown as User;

      const user2 = this.userRepository.create({
        username: '艺术爱好者',
        email: 'user2@heritage.com',
        password: hashedPassword,
        walletAddress: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
        balance: 30000,
        role: 'user',
      });
      await this.userRepository.save(user2) as unknown as User;

      const collectionsData = [
        {
          name: '景德镇青花瓷',
          description: '景德镇青花瓷是中国传统名瓷之一，始创于唐代，盛于明清。青花瓷以其独特的蓝白相间的装饰风格，成为中国陶瓷艺术的杰出代表。',
          category: '陶瓷',
          region: '江西',
          heritageType: '传统工艺',
          artist: '景德镇非遗传承人',
          image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
          history: '青花瓷始创于唐代，成熟于元代，明代永乐、宣德时期达到顶峰。2006年，景德镇手工制瓷技艺被列入国家级非物质文化遗产名录。',
        },
        {
          name: '苏绣精品',
          description: '苏绣是中国四大名绣之一，以其精细的针法、秀丽的图案、淡雅的色彩著称，被誉为"东方艺术明珠"。',
          category: '刺绣',
          region: '江苏',
          heritageType: '传统技艺',
          artist: '苏州刺绣大师',
          image: 'https://images.unsplash.com/photo-1594040226829-7f251ab46d80?w=400',
          history: '苏绣具有2000多年历史，早在三国时期就有记载。清代是苏绣的鼎盛时期，2006年被列入国家级非物质文化遗产名录。',
        },
        {
          name: '宣纸制作',
          description: '宣纸是中国传统书画用纸，质地绵韧、光洁如玉、不蛀不腐，被誉为"纸寿千年"。',
          category: '造纸',
          region: '安徽',
          heritageType: '传统技艺',
          artist: '泾县宣纸工匠',
          image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400',
          history: '宣纸始于唐代，原产于安徽泾县。2009年，宣纸传统制作技艺被联合国教科文组织列入人类非物质文化遗产代表作名录。',
        },
        {
          name: '京剧脸谱',
          description: '京剧脸谱是中国京剧艺术中演员面部化妆的一种程式，具有独特的民族风格和审美价值。',
          category: '戏曲',
          region: '北京',
          heritageType: '传统戏剧',
          artist: '京剧表演艺术家',
          image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          history: '京剧形成于清代乾隆年间，被誉为"国剧"。2010年，京剧被联合国教科文组织列入人类非物质文化遗产代表作名录。',
        },
        {
          name: '川江号子',
          description: '川江号子是长江船工在劳动中创造的民间音乐，旋律激昂，节奏鲜明，是巴蜀文化的重要组成部分。',
          category: '音乐',
          region: '四川',
          heritageType: '传统音乐',
          artist: '川江船工',
          image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
          history: '川江号子历史悠久，是长江航运史的活化石。2006年被列入国家级非物质文化遗产名录。',
        },
        {
          name: '东阳木雕',
          description: '东阳木雕是中国四大木雕之一，以其浮雕技法见长，雕刻细腻，层次分明，被誉为"雕花状元"。',
          category: '木雕',
          region: '浙江',
          heritageType: '传统美术',
          artist: '东阳木雕大师',
          image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          history: '东阳木雕始于唐代，盛于明清。2006年，东阳木雕被列入国家级非物质文化遗产名录。',
        },
      ];

      const collections: Collection[] = [];
      for (const data of collectionsData) {
        const collection = this.collectionRepository.create(data);
        const saved = await this.collectionRepository.save(collection) as unknown as Collection;
        collections.push(saved);
      }

      const users = [admin, user1, user2];
      let nftIndex = 1;

      for (const collection of collections) {
        const numNfts = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numNfts; i++) {
          const owner = users[Math.floor(Math.random() * users.length)];
          const price = (Math.floor(Math.random() * 90) + 10) * 100;

          const metadata = {
            name: `${collection.name} #${i + 1}`,
            description: collection.description,
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
            status: Math.random() > 0.3 ? 'available' : 'not_for_sale',
            metadataUri: `ipfs://heritage/${tokenId}`,
            tokenUri: `ipfs://heritage/${tokenId}`,
            royaltyFee: 5,
            edition: i + 1,
            totalEditions: numNfts,
            blockchain: 'HeritageChain',
            transactionHash,
            blockNumber,
            owner,
            collection,
          });

          await this.nftRepository.save(nft);
          nftIndex++;
        }
      }

      this.logger.log(`Seeding completed: ${collections.length} collections, ${nftIndex - 1} NFTs created`);
    } catch (error) {
      this.logger.error(`Seeding failed: ${error.message}`);
    }
  }
}
