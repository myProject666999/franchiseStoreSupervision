import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const databaseConfig: MysqlConnectionOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '123456',
  database: 'franchise_store_supervision',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
  charset: 'utf8mb4',
  timezone: '+08:00',
};

export const jwtConfig = {
  secret: 'franchise-store-supervision-secret-key-2024',
  expiresIn: '24h',
};
