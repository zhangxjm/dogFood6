import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class BoothService {
  constructor(@Inject('DATABASE') private db: any) {}

  findAll() {
    const stmt = this.db.prepare('SELECT * FROM booths ORDER BY created_at DESC');
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  findByExhibition(exhibitionId: number) {
    const stmt = this.db.prepare('SELECT * FROM booths WHERE exhibition_id = ? ORDER BY id');
    stmt.bind([exhibitionId]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  findOne(id: number) {
    const stmt = this.db.prepare('SELECT * FROM booths WHERE id = ?');
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
      `INSERT INTO booths (exhibition_id, name, owner_id, position_x, position_y, position_z, rotation, theme, custom_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.exhibition_id,
        data.name,
        data.owner_id || null,
        data.position_x || 0,
        data.position_y || 0,
        data.position_z || 0,
        data.rotation || 0,
        data.theme || 'default',
        JSON.stringify(data.custom_data || {}),
      ]
    );
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    this.db.save();
    return this.findOne(id);
  }

  update(id: number, data: any) {
    const existing = this.findOne(id);
    if (!existing) return null;

    const customData = data.custom_data
      ? JSON.stringify({ ...JSON.parse(existing.custom_data || '{}'), ...data.custom_data })
      : existing.custom_data;

    const name = data.name !== undefined ? data.name : existing.name;
    const position_x = data.position_x !== undefined ? data.position_x : existing.position_x;
    const position_y = data.position_y !== undefined ? data.position_y : existing.position_y;
    const position_z = data.position_z !== undefined ? data.position_z : existing.position_z;
    const rotation = data.rotation !== undefined ? data.rotation : existing.rotation;
    const theme = data.theme !== undefined ? data.theme : existing.theme;

    this.db.run(
      `UPDATE booths SET
        name = ?,
        position_x = ?,
        position_y = ?,
        position_z = ?,
        rotation = ?,
        theme = ?,
        custom_data = ?
       WHERE id = ?`,
      [name, position_x, position_y, position_z, rotation, theme, customData, id]
    );
    this.db.save();
    return this.findOne(id);
  }

  customize(id: number, data: any) {
    return this.update(id, { custom_data: data });
  }

  remove(id: number) {
    this.db.run('DELETE FROM booths WHERE id = ?', [id]);
    this.db.save();
    return { success: true };
  }

  getNfts(boothId: number) {
    const stmt = this.db.prepare('SELECT * FROM nfts WHERE booth_id = ?');
    stmt.bind([boothId]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }
}
