import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'cil-china-db.postgres.database.azure.com',
  port: 5432,
  username: 'cilchinaadmin@cil-china-db',
  password: 'enVXKzgSEEDzbtLVS26FrzcqX6ZfnCj3n2DeSR6V',
  database: 'il-customer-db',
  entities: [__dirname + 'dist/../**/*.entity.{js,ts}'],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  maxQueryExecutionTime: 300000,
  cache: false,
  migrationsTableName: 'migrations',
  connectTimeoutMS: 0,
  logNotifications: true
}

// export const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'p@55w0rd',
//   database: 'cil-china',
//   entities: [__dirname + 'dist/../**/*.entity.{js,ts}'],
//  synchronize: false,
//   logging: false,
//   namingStrategy: new SnakeNamingStrategy(),
//   maxQueryExecutionTime: 300000,
//   cache: true,
//   migrationsTableName: 'migrations',
//   connectTimeoutMS: 0,
//   logNotifications: true
// }
