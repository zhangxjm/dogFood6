import { Module, Global, OnModuleInit, Inject } from '@nestjs/common';
import initSqlJs, { Database } from 'sql.js';
import { join } from 'path';
import * as fs from 'fs';

@Global()
@Module({
  providers: [
    {
      provide: 'DATABASE',
      useFactory: async () => {
        const SQL = await initSqlJs();
        const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/exhibition.db');
        
        const dataDir = join(dbPath, '..');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        let db: Database;
        if (fs.existsSync(dbPath)) {
          const fileBuffer = fs.readFileSync(dbPath);
          db = new SQL.Database(fileBuffer);
        } else {
          db = new SQL.Database();
        }

        const saveDb = () => {
          const data = db.export();
          const buffer = Buffer.from(data);
          fs.writeFileSync(dbPath, buffer);
        };

        (db as any).save = saveDb;
        return db;
      },
    },
  ],
  exports: ['DATABASE'],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@Inject('DATABASE') private db: any) {}

  onModuleInit() {
    this.initializeTables();
    this.initializeData();
  }

  private initializeTables() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        avatar_data TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exhibitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        start_date DATETIME,
        end_date DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS booths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exhibition_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        owner_id INTEGER,
        position_x REAL DEFAULT 0,
        position_y REAL DEFAULT 0,
        position_z REAL DEFAULT 0,
        rotation REAL DEFAULT 0,
        theme TEXT DEFAULT 'default',
        custom_data TEXT DEFAULT '{}',
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nfts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booth_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        metadata TEXT DEFAULT '{}',
        total_supply INTEGER DEFAULT 100,
        minted_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_nfts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        nft_id INTEGER NOT NULL,
        minted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, nft_id)
      );
    `);
    this.db.save();
  }

  private initializeData() {
    const userCount = this.db.exec('SELECT COUNT(*) as count FROM users')[0].values[0][0] as number;
    if (userCount === 0) {
      this.db.run("INSERT INTO users (username, avatar_data) VALUES (?, ?)", ['demo_user_01', JSON.stringify({ color: '#4A90D9', style: 'robot' })]);
      this.db.run("INSERT INTO users (username, avatar_data) VALUES (?, ?)", ['demo_user_02', JSON.stringify({ color: '#D94A4A', style: 'human' })]);
      this.db.run("INSERT INTO users (username, avatar_data) VALUES (?, ?)", ['demo_user_03', JSON.stringify({ color: '#4AD974', style: 'alien' })]);
    }

    const exhibitionCount = this.db.exec('SELECT COUNT(*) as count FROM exhibitions')[0].values[0][0] as number;
    if (exhibitionCount === 0) {
      const now = new Date().toISOString();
      const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      this.db.run("INSERT INTO exhibitions (name, description, start_date, end_date) VALUES (?, ?, ?, ?)", ['元宇宙科技展', '探索未来科技与数字艺术的沉浸式展会', now, future]);
      this.db.run("INSERT INTO exhibitions (name, description, start_date, end_date) VALUES (?, ?, ?, ?)", ['数字艺术博览会', '全球顶尖数字艺术家作品展示', now, future]);
    }

    const boothCount = this.db.exec('SELECT COUNT(*) as count FROM booths')[0].values[0][0] as number;
    if (boothCount === 0) {
      const booths = [
        [1, 'AI 创新展区', 1, -8, 0, -4, 0, 'cyber', JSON.stringify({ color: '#00D4FF', description: '人工智能技术前沿展示' })],
        [1, 'VR 体验馆', 2, 8, 0, -4, 0, 'futuristic', JSON.stringify({ color: '#FF6B6B', description: '虚拟现实沉浸式体验' })],
        [1, '区块链中心', 3, -8, 0, 4, 0, 'matrix', JSON.stringify({ color: '#4ECDC4', description: 'Web3与区块链技术展示' })],
        [1, '数字艺术廊', 1, 8, 0, 4, 0, 'gallery', JSON.stringify({ color: '#FFE66D', description: '数字艺术作品展览' })],
        [2, '3D 艺术空间', 2, 0, 0, -8, 0, 'art', JSON.stringify({ color: '#95E1D3', description: '3D数字艺术创作展示' })],
        [2, 'NFT 展览馆', 3, 0, 0, 8, 0, 'nft', JSON.stringify({ color: '#F38181', description: 'NFT数字藏品展示交易' })],
      ];
      booths.forEach(b => {
        this.db.run("INSERT INTO booths (exhibition_id, name, owner_id, position_x, position_y, position_z, rotation, theme, custom_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", b);
      });
    }

    const nftCount = this.db.exec('SELECT COUNT(*) as count FROM nfts')[0].values[0][0] as number;
    if (nftCount === 0) {
      const nfts = [
        [1, 'AI 创世者', 'AI技术系列数字藏品', JSON.stringify({ rarity: 'legendary', category: 'AI' }), 100],
        [1, '神经网络', '神经网络可视化藏品', JSON.stringify({ rarity: 'epic', category: 'AI' }), 100],
        [2, 'VR 开拓者', 'VR虚拟体验藏品', JSON.stringify({ rarity: 'rare', category: 'VR' }), 100],
        [3, '链上之魂', '区块链精神象征', JSON.stringify({ rarity: 'legendary', category: 'Blockchain' }), 100],
        [3, '智能合约', '智能合约艺术化', JSON.stringify({ rarity: 'epic', category: 'Blockchain' }), 100],
        [4, '像素大师', '像素艺术杰作', JSON.stringify({ rarity: 'rare', category: 'Art' }), 100],
        [5, '维度穿越', '3D维度艺术作品', JSON.stringify({ rarity: 'epic', category: '3D' }), 100],
        [6, '数字黄金', 'NFT价值象征', JSON.stringify({ rarity: 'legendary', category: 'NFT' }), 100],
      ];
      nfts.forEach(n => {
        this.db.run("INSERT INTO nfts (booth_id, name, description, metadata, total_supply) VALUES (?, ?, ?, ?, ?)", [n[0], n[1], n[2], n[3], n[4]]);
      });
    }

    this.db.save();
  }
}
