import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { NFT } from './nft.entity';
import { User } from './user.entity';

@Entity('copyrights')
export class Copyright {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  workName: string;

  @Column()
  author: string;

  @Column()
  copyrightHolder: string;

  @Column({ default: '' })
  workType: string;

  @Column({ default: '' })
  creationDate: string;

  @Column({ default: '' })
  registrationDate: string;

  @Column({ default: '' })
  certificateUrl: string;

  @Column({ default: '' })
  blockchainProof: string;

  @Column({ default: 'verified' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => NFT, nft => nft.copyrights)
  nft: NFT;

  @ManyToOne(() => User)
  applicant: User;
}
