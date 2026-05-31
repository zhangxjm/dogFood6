import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { NFT } from './nft.entity';

@Entity('collections')
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column()
  region: string;

  @Column({ default: '' })
  image: string;

  @Column()
  heritageType: string;

  @Column({ default: '' })
  artist: string;

  @Column('text', { default: '' })
  history: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => NFT, nft => nft.collection)
  nfts: NFT[];
}
