import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ExhibitionService {
  constructor(@Inject('DATABASE') private db: any) {}

  private rowsToObjects(result: any): any[] {
    if (!result || result.length === 0) return [];
    const columns = result[0].columns;
    return result[0].values.map((row: any[]) => {
      const obj: any = {};
      columns.forEach((col: string, idx: number) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  }

  private rowToObject(result: any): any | null {
    const rows = this.rowsToObjects(result);
    return rows.length > 0 ? rows[0] : null;
  }

  findAll() {
    const result = this.db.exec('SELECT * FROM exhibitions ORDER BY created_at DESC');
    return this.rowsToObjects(result);
  }

  findOne(id: number) {
    const stmt = this.db.prepare('SELECT * FROM exhibitions WHERE id = ?');
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
      'INSERT INTO exhibitions (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.description, data.start_date, data.end_date, data.status || 'active']
    );
    const id = this.db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    this.db.save();
    return this.findOne(id);
  }

  update(id: number, data: any) {
    const existing = this.findOne(id);
    if (!existing) return null;

    const name = data.name !== undefined ? data.name : existing.name;
    const description = data.description !== undefined ? data.description : existing.description;
    const start_date = data.start_date !== undefined ? data.start_date : existing.start_date;
    const end_date = data.end_date !== undefined ? data.end_date : existing.end_date;
    const status = data.status !== undefined ? data.status : existing.status;

    this.db.run(
      'UPDATE exhibitions SET name = ?, description = ?, start_date = ?, end_date = ?, status = ? WHERE id = ?',
      [name, description, start_date, end_date, status, id]
    );
    this.db.save();
    return this.findOne(id);
  }

  remove(id: number) {
    this.db.run('DELETE FROM exhibitions WHERE id = ?', [id]);
    this.db.save();
    return { success: true };
  }

  getBooths(exhibitionId: number) {
    const stmt = this.db.prepare('SELECT * FROM booths WHERE exhibition_id = ?');
    stmt.bind([exhibitionId]);
    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();
    return result;
  }
}
