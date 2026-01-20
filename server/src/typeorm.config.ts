import { join } from 'path';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  entities: [join(__dirname, '**/*.entity.ts')],
  migrations: [join(__dirname, 'migrations/*{.js,.ts}')],
  migrationsTableName: `typeorm_migrations`,
});
