import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private isConnected = false;

  constructor() {
    const esHost = process.env.ES_HOST || 'http://localhost:9200';
    this.client = new Client({ node: esHost });
  }

  async onModuleInit() {
    await this.connect();
    await this.createIndices();
  }

  private async connect() {
    try {
      await this.client.ping();
      this.isConnected = true;
      this.logger.log('Connected to Elasticsearch successfully');
    } catch (error) {
      this.logger.warn(`Elasticsearch connection failed: ${error.message}`);
      this.logger.warn('Running without Elasticsearch - search functionality will be limited');
      this.isConnected = false;
    }
  }

  private async createIndices() {
    if (!this.isConnected) return;

    try {
      const nftIndexExists = await this.client.indices.exists({ index: 'nfts' });
      if (!nftIndexExists) {
        await this.client.indices.create({
          index: 'nfts',
          body: {
            mappings: {
              properties: {
                id: { type: 'integer' },
                tokenId: { type: 'keyword' },
                name: { type: 'text', analyzer: 'ik_max_word' },
                description: { type: 'text', analyzer: 'ik_max_word' },
                category: { type: 'keyword' },
                heritageType: { type: 'keyword' },
                region: { type: 'keyword' },
                price: { type: 'float' },
                status: { type: 'keyword' },
                createdAt: { type: 'date' },
              },
            },
          },
        });
        this.logger.log('Created nfts index');
      }

      const collectionsIndexExists = await this.client.indices.exists({ index: 'collections' });
      if (!collectionsIndexExists) {
        await this.client.indices.create({
          index: 'collections',
          body: {
            mappings: {
              properties: {
                id: { type: 'integer' },
                name: { type: 'text', analyzer: 'ik_max_word' },
                description: { type: 'text', analyzer: 'ik_max_word' },
                category: { type: 'keyword' },
                heritageType: { type: 'keyword' },
                region: { type: 'keyword' },
                artist: { type: 'text' },
              },
            },
          },
        });
        this.logger.log('Created collections index');
      }
    } catch (error) {
      this.logger.error(`Failed to create indices: ${error.message}`);
    }
  }

  async indexNFT(nft: any) {
    if (!this.isConnected) return null;

    try {
      const result = await this.client.index({
        index: 'nfts',
        id: nft.id.toString(),
        body: {
          id: nft.id,
          tokenId: nft.tokenId,
          name: nft.name,
          description: nft.description,
          category: nft.collection?.category || '',
          heritageType: nft.collection?.heritageType || '',
          region: nft.collection?.region || '',
          price: nft.price,
          status: nft.status,
          createdAt: nft.createdAt,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to index NFT: ${error.message}`);
      return null;
    }
  }

  async indexCollection(collection: any) {
    if (!this.isConnected) return null;

    try {
      const result = await this.client.index({
        index: 'collections',
        id: collection.id.toString(),
        body: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          category: collection.category,
          heritageType: collection.heritageType,
          region: collection.region,
          artist: collection.artist,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(`Failed to index collection: ${error.message}`);
      return null;
    }
  }

  async searchNFTs(query: string, filters: any = {}): Promise<any[]> {
    if (!this.isConnected) return [];

    try {
      const must: any[] = [];

      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['name^3', 'description'],
            fuzziness: 'AUTO',
          },
        });
      }

      if (filters.category) {
        must.push({ term: { category: filters.category } });
      }

      if (filters.heritageType) {
        must.push({ term: { heritageType: filters.heritageType } });
      }

      if (filters.region) {
        must.push({ term: { region: filters.region } });
      }

      if (filters.status) {
        must.push({ term: { status: filters.status } });
      }

      const result = await this.client.search({
        index: 'nfts',
        body: {
          query: {
            bool: {
              must,
            },
          },
          sort: [{ createdAt: { order: 'desc' } }],
          size: 100,
        },
      });

      return result.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      this.logger.error(`Failed to search NFTs: ${error.message}`);
      return [];
    }
  }

  async searchCollections(query: string, filters: any = {}): Promise<any[]> {
    if (!this.isConnected) return [];

    try {
      const must: any[] = [];

      if (query) {
        must.push({
          multi_match: {
            query,
            fields: ['name^3', 'description', 'artist'],
            fuzziness: 'AUTO',
          },
        });
      }

      if (filters.category) {
        must.push({ term: { category: filters.category } });
      }

      if (filters.heritageType) {
        must.push({ term: { heritageType: filters.heritageType } });
      }

      const result = await this.client.search({
        index: 'collections',
        body: {
          query: {
            bool: {
              must,
            },
          },
          size: 100,
        },
      });

      return result.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      this.logger.error(`Failed to search collections: ${error.message}`);
      return [];
    }
  }

  async deleteNFT(id: number) {
    if (!this.isConnected) return null;

    try {
      return await this.client.delete({
        index: 'nfts',
        id: id.toString(),
      });
    } catch (error) {
      this.logger.error(`Failed to delete NFT from index: ${error.message}`);
      return null;
    }
  }
}
