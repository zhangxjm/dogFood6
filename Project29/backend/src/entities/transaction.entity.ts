import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { NFT } from './nft.entity';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  txHash: string;

  @Column()
  type: string;

  @Column()
  price: number;

  @Column({ default: '' })
  currency: string;

  @Column({ default: 'completed' })
  status: string;

  @Column({ default: '' })
  blockchainTxHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.sales)
  seller: User;

  @ManyToOne(() => User, user => user.purchases)
  buyer: User;

  @ManyToOne(() => NFT, nft => nft.transactions)
  nft: NFT;
}
