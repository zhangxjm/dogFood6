import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { NFT } from '../entities/nft.entity';
import { User } from '../entities/user.entity';
import { BlockchainService } from '../services/blockchain.service';
import { createHash } from 'crypto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private blockchainService: BlockchainService,
  ) {}

  async buyNFT(nftId: number, buyerId: number): Promise<Transaction> {
    const nft = await this.nftRepository.findOne({
      where: { id: nftId },
      relations: ['owner'],
    });

    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    if (nft.status !== 'available') {
      throw new BadRequestException('NFT is not available for purchase');
    }

    if (nft.owner.id === buyerId) {
      throw new BadRequestException('You cannot buy your own NFT');
    }

    const buyer = await this.userRepository.findOne({ where: { id: buyerId } });
    if (!buyer) {
      throw new NotFoundException('Buyer not found');
    }
    const seller = nft.owner;

    if (buyer.balance < nft.price) {
      throw new BadRequestException('Insufficient balance');
    }

    const { transactionHash, blockNumber } = await this.blockchainService.transferNFT(
      nft.tokenId,
      seller.walletAddress,
      buyer.walletAddress,
      nft.price,
    );

    buyer.balance -= nft.price;
    seller.balance += nft.price;
    await this.userRepository.save([buyer, seller]) as unknown as User[];

    nft.owner = buyer;
    nft.status = 'sold';
    await this.nftRepository.save(nft) as unknown as NFT;

    const txHash = createHash('sha256')
      .update(`${nftId}-${buyerId}-${Date.now()}`)
      .digest('hex');

    const transaction = this.transactionRepository.create({
      txHash,
      type: 'purchase',
      price: nft.price,
      currency: 'CNY',
      status: 'completed',
      blockchainTxHash: transactionHash,
      seller,
      buyer,
      nft,
    });

    return this.transactionRepository.save(transaction) as unknown as Transaction;
  }

  async findAll(page: number = 1, limit: number = 20, filters: any = {}): Promise<{ data: Transaction[]; total: number }> {
    const where: any = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;

    const [data, total] = await this.transactionRepository.findAndCount({
      where,
      relations: ['seller', 'buyer', 'nft'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findByUser(userId: number): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: [{ buyer: { id: userId } }, { seller: { id: userId } }],
      relations: ['seller', 'buyer', 'nft'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(): Promise<any> {
    const totalTransactions = await this.transactionRepository.count();
    const totalVolume = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.price)', 'total')
      .where('tx.status = :status', { status: 'completed' })
      .getRawOne();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVolume = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.price)', 'total')
      .where('tx.status = :status AND tx.createdAt >= :today', { status: 'completed', today })
      .getRawOne();

    return {
      totalTransactions,
      totalVolume: totalVolume?.total || 0,
      todayVolume: todayVolume?.total || 0,
    };
  }
}
