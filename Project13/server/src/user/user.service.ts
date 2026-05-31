import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: any) {}

  findAll() {
    const stmt = this.db.prepare('SELECT id, username, avatar_data, created_at FROM users ORDER BY created_at DESC');
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  findOne(id: number) {
    const stmt = this.db.prepare('SELECT id, username, avatar_data, created_at FROM users WHERE id = ?');
    stmt.bind([id]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result.length > 0 ? result[0] : null;
  }

  findByUsername(username: string) {
    const stmt = this.db.prepare('SELECT id, username, avatar_data, created_at FROM users WHERE username = ?');
    stmt.bind([username]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result.length > 0 ? result[0] : null;
  }

  create(data: any) {
    try {
      this.db.run('INSERT INTO users (username, avatar_data) VALUES (?, ?)', [
        data.username,
        JSON.stringify(data.avatar_data || {}),
      ]);
      const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
      this.db.save();
      return this.findOne(id);
    } catch (e) {
      return this.findByUsername(data.username);
    }
  }

  login(username: string) {
    let user = this.findByUsername(username);
    if (!user) {
      user = this.create({ username, avatar_data: { color: '#4A90D9', style: 'robot' } });
    }
    return user;
  }

  update(id: number, data: any) {
    const existing = this.findOne(id);
    if (!existing) return null;

    const username = data.username !== undefined ? data.username : existing.username;
    this.db.run('UPDATE users SET username = ? WHERE id = ?', [username, id]);
    this.db.save();
    return this.findOne(id);
  }

  updateAvatar(id: number, avatarData: any) {
    const existing = this.findOne(id);
    if (!existing) return null;
    const newAvatar = JSON.stringify({ ...JSON.parse(existing.avatar_data || '{}'), ...avatarData });
    this.db.run('UPDATE users SET avatar_data = ? WHERE id = ?', [newAvatar, id]);
    this.db.save();
    return this.findOne(id);
  }

  getUserNfts(userId: number) {
    const stmt = this.db.prepare(
      `SELECT n.*, un.minted_at FROM user_nfts un
       JOIN nfts n ON un.nft_id = n.id
       WHERE un.user_id = ?
       ORDER BY un.minted_at DESC`
    );
    stmt.bind([userId]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }

  remove(id: number) {
    this.db.run('DELETE FROM users WHERE id = ?', [id]);
    this.db.save();
    return { success: true };
  }
}
