import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { NFT } from './nft.entity';
import { Transaction } from './transaction.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: '' })
  walletAddress: string;

  @Column({ default: 0 })
  balance: number;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 0 })
  reputation: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NFT, nft => nft.owner)
  nfts: NFT[];

  @OneToMany(() => Transaction, transaction => transaction.seller)
  sales: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.buyer)
  purchases: Transaction[];
}
