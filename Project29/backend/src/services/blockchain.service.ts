import { Injectable, Logger } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private blocks: any[] = [];
  private pendingTransactions: any[] = [];

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesisBlock = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: this.calculateHash(0, Date.now(), [], '0'),
      nonce: 0,
    };
    this.blocks.push(genesisBlock);
  }

  private calculateHash(index: number, timestamp: number, transactions: any[], previousHash: string, nonce: number = 0): string {
    const data = `${index}${timestamp}${JSON.stringify(transactions)}${previousHash}${nonce}`;
    return createHash('sha256').update(data).digest('hex');
  }

  private proofOfWork(index: number, timestamp: number, transactions: any[], previousHash: string): { hash: string; nonce: number } {
    let nonce = 0;
    let hash = '';
    const difficulty = 4;
    const target = '0'.repeat(difficulty);

    while (!hash.startsWith(target)) {
      nonce++;
      hash = this.calculateHash(index, timestamp, transactions, previousHash, nonce);
    }

    return { hash, nonce };
  }

  async mintNFT(metadata: any): Promise<{ tokenId: string; transactionHash: string; blockNumber: string }> {
    this.logger.log(`Minting NFT with metadata: ${JSON.stringify(metadata)}`);

    const tokenId = `HTG-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const transaction = {
      type: 'MINT',
      tokenId,
      metadata,
      timestamp: Date.now(),
    };

    const { transactionHash, blockNumber } = await this.addTransaction(transaction);

    return {
      tokenId,
      transactionHash,
      blockNumber,
    };
  }

  async transferNFT(tokenId: string, from: string, to: string, price: number): Promise<{ transactionHash: string; blockNumber: string }> {
    this.logger.log(`Transferring NFT ${tokenId} from ${from} to ${to} for ${price}`);

    const transaction = {
      type: 'TRANSFER',
      tokenId,
      from,
      to,
      price,
      timestamp: Date.now(),
    };

    return this.addTransaction(transaction);
  }

  async registerCopyright(workData: any): Promise<{ registrationNumber: string; blockchainProof: string; blockNumber: string }> {
    this.logger.log(`Registering copyright: ${workData.workName}`);

    const registrationNumber = `CR-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const transaction = {
      type: 'COPYRIGHT_REGISTER',
      registrationNumber,
      workData,
      timestamp: Date.now(),
    };

    const { transactionHash, blockNumber } = await this.addTransaction(transaction);

    return {
      registrationNumber,
      blockchainProof: transactionHash,
      blockNumber,
    };
  }

  private async addTransaction(transaction: any): Promise<{ transactionHash: string; blockNumber: string }> {
    const transactionHash = createHash('sha256')
      .update(JSON.stringify(transaction))
      .digest('hex');

    this.pendingTransactions.push({
      ...transaction,
      hash: transactionHash,
    });

    await this.mineBlock();

    return {
      transactionHash,
      blockNumber: this.blocks.length.toString(),
    };
  }

  private async mineBlock(): Promise<any> {
    const lastBlock = this.blocks[this.blocks.length - 1];
    const index = lastBlock.index + 1;
    const timestamp = Date.now();
    const transactions = [...this.pendingTransactions];

    const { hash, nonce } = this.proofOfWork(index, timestamp, transactions, lastBlock.hash);

    const newBlock = {
      index,
      timestamp,
      transactions,
      previousHash: lastBlock.hash,
      hash,
      nonce,
    };

    this.blocks.push(newBlock);
    this.pendingTransactions = [];

    this.logger.log(`Block ${index} mined: ${hash}`);

    return newBlock;
  }

  getBlock(blockNumber: number): any {
    return this.blocks[blockNumber] || null;
  }

  getTransaction(transactionHash: string): any {
    for (const block of this.blocks) {
      const tx = block.transactions.find((t: any) => t.hash === transactionHash);
      if (tx) return { ...tx, blockNumber: block.index };
    }
    return null;
  }

  verifyTransaction(transactionHash: string): boolean {
    const tx = this.getTransaction(transactionHash);
    return !!tx;
  }

  getChainLength(): number {
    return this.blocks.length;
  }
}
