import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Collection } from './collection.entity';
import { Transaction } from './transaction.entity';
import { Copyright } from './copyright.entity';

@Entity('nfts')
export class NFT {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  tokenId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  image: string;

  @Column({ default: 0 })
  price: number;

  @Column({ default: 'available' })
  status: string;

  @Column({ default: '' })
  metadataUri: string;

  @Column({ default: '' })
  tokenUri: string;

  @Column({ default: 0 })
  royaltyFee: number;

  @Column({ default: 1 })
  edition: number;

  @Column({ default: 1 })
  totalEditions: number;

  @Column({ default: '' })
  blockchain: string;

  @Column({ default: '' })
  transactionHash: string;

  @Column({ default: '' })
  blockNumber: string;

  @CreateDateColumn()
  mintedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.nfts)
  owner: User;

  @ManyToOne(() => Collection, collection => collection.nfts)
  collection: Collection;

  @OneToMany(() => Transaction, transaction => transaction.nft)
  transactions: Transaction[];

  @OneToMany(() => Copyright, copyright => copyright.nft)
  copyrights: Copyright[];
}
