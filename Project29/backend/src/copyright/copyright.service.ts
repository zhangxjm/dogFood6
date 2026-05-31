import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Copyright } from '../entities/copyright.entity';
import { NFT } from '../entities/nft.entity';
import { User } from '../entities/user.entity';
import { BlockchainService } from '../services/blockchain.service';

@Injectable()
export class CopyrightService {
  constructor(
    @InjectRepository(Copyright)
    private copyrightRepository: Repository<Copyright>,
    @InjectRepository(NFT)
    private nftRepository: Repository<NFT>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private blockchainService: BlockchainService,
  ) {}

  async register(nftId: number, applicantId: number, data: any): Promise<Copyright> {
    const nft = await this.nftRepository.findOne({ where: { id: nftId } });
    if (!nft) {
      throw new NotFoundException('NFT not found');
    }

    const applicant = await this.userRepository.findOne({ where: { id: applicantId } });
    if (!applicant) {
      throw new NotFoundException('User not found');
    }

    const workData = {
      workName: data.workName || nft.name,
      author: data.author || applicant.username,
      copyrightHolder: data.copyrightHolder || applicant.username,
      workType: data.workType || 'Digital Art',
      creationDate: data.creationDate || new Date().toISOString().split('T')[0],
      description: nft.description,
    };

    const { registrationNumber, blockchainProof, blockNumber } = await this.blockchainService.registerCopyright(workData);

    const copyright = this.copyrightRepository.create({
      registrationNumber,
      workName: workData.workName,
      author: workData.author,
      copyrightHolder: workData.copyrightHolder,
      workType: workData.workType,
      creationDate: workData.creationDate,
      registrationDate: new Date().toISOString().split('T')[0],
      certificateUrl: `/api/certificates/${registrationNumber}`,
      blockchainProof,
      status: 'verified',
      nft,
      applicant,
    });

    return this.copyrightRepository.save(copyright) as unknown as Copyright;
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ data: Copyright[]; total: number }> {
    const [data, total] = await this.copyrightRepository.findAndCount({
      relations: ['nft', 'applicant'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Copyright> {
    const copyright = await this.copyrightRepository.findOne({
      where: { id },
      relations: ['nft', 'applicant'],
    });
    if (!copyright) {
      throw new NotFoundException('Copyright not found');
    }
    return copyright;
  }

  async findByNFT(nftId: number): Promise<Copyright[]> {
    return this.copyrightRepository.find({
      where: { nft: { id: nftId } },
      relations: ['applicant'],
    });
  }

  async verify(registrationNumber: string): Promise<any> {
    const copyright = await this.copyrightRepository.findOne({
      where: { registrationNumber },
      relations: ['nft', 'applicant'],
    });

    if (!copyright) {
      return { verified: false, message: 'Registration number not found' };
    }

    const blockchainValid = this.blockchainService.verifyTransaction(copyright.blockchainProof);

    return {
      verified: true,
      blockchainValid,
      data: copyright,
    };
  }
}
