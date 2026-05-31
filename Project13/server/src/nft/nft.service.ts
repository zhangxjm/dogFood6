import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class NftService {
  constructor(@Inject('DATABASE') private db: any) {}

  findAll() {
    const stmt = this.db.prepare('SELECT * FROM nfts ORDER BY created_at DESC');
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  findByBooth(boothId: number) {
    const stmt = this.db.prepare('SELECT * FROM nfts WHERE booth_id = ? ORDER BY id');
    stmt.bind([boothId]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  findOne(id: number) {
    const stmt = this.db.prepare('SELECT * FROM nfts WHERE id = ?');
    stmt.bind([id]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result.length > 0 ? result[0] : null;
  }

  create(data: any) {
    this.db.run(
      `INSERT INTO nfts (booth_id, name, description, image_url, metadata, total_supply)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.booth_id,
        data.name,
        data.description || '',
        data.image_url || '',
        JSON.stringify(data.metadata || {}),
        data.total_supply || 100,
      ]
    );
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    this.db.save();
    return this.findOne(id);
  }

  mint(userId: number, nftId: number) {
    const nft = this.findOne(nftId);
    if (!nft) {
      return { success: false, message: 'NFT不存在' };
    }
    if (nft.minted_count >= nft.total_supply) {
      return { success: false, message: '该NFT已全部兑换完毕' };
    }

    const checkStmt = this.db.prepare('SELECT id FROM user_nfts WHERE user_id = ? AND nft_id = ?');
    checkStmt.bind([userId, nftId]);
    const existing = [];
    while (checkStmt.step()) {
      existing.push(checkStmt.getAsObject());
    }
    checkStmt.free();
    if (existing.length > 0) {
      return { success: false, message: '您已拥有该NFT' };
    }

    try {
      this.db.run('INSERT INTO user_nfts (user_id, nft_id) VALUES (?, ?)', [userId, nftId]);
      this.db.run('UPDATE nfts SET minted_count = minted_count + 1 WHERE id = ?', [nftId]);
      this.db.save();
      return { success: true, message: 'NFT兑换成功', nft };
    } catch (e) {
      return { success: false, message: '兑换失败' };
    }
  }

  update(id: number, data: any) {
    const existing = this.findOne(id);
    if (!existing) return null;

    const metadata = data.metadata
      ? JSON.stringify({ ...JSON.parse(existing.metadata || '{}'), ...data.metadata })
      : existing.metadata;

    const name = data.name !== undefined ? data.name : existing.name;
    const description = data.description !== undefined ? data.description : existing.description;
    const image_url = data.image_url !== undefined ? data.image_url : existing.image_url;
    const total_supply = data.total_supply !== undefined ? data.total_supply : existing.total_supply;

    this.db.run(
      `UPDATE nfts SET
        name = ?,
        description = ?,
        image_url = ?,
        metadata = ?,
        total_supply = ?
       WHERE id = ?`,
      [name, description, image_url, metadata, total_supply, id]
    );
    this.db.save();
    return this.findOne(id);
  }

  remove(id: number) {
    this.db.run('DELETE FROM nfts WHERE id = ?', [id]);
    this.db.save();
    return { success: true };
  }
}
