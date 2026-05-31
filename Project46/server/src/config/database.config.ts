import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqljs',
  location: path.join(process.cwd(), 'data', 'metaverse-office.db'),
  autoSave: true,
  entities: [path.join(__dirname, '..', '**', '*.entity.{js,ts}')],
  synchronize: true,
  logging: false,
};
