import { TypeOrmModuleOptions } from '@nestjs/typeorm';
const SnakeNamingStrategy = require('typeorm-naming-strategies')
  .SnakeNamingStrategy;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'il-customer-db.postgres.database.azure.com',
  port: 5432,
  username: 'ilcustomeradmin@il-customer-db',
  password: 'y4abh5azd7FQD4Z5KxPgvKWTvNtPP3XQs3466bXP',
  database: 'il-customer-db',
  entities: [__dirname + 'dist/../**/*.entity.{js,ts}'],
  synchronize: true,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  maxQueryExecutionTime: 300000,
  cache: true,
  migrationsTableName: 'migrations',
  connectTimeoutMS: 0,
  logNotifications: true
}

// export const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   customername: 'postgres',
//   password: 'p@55w0rd',
//   database: 'cil-china',
//   entities: [__dirname + 'dist/../**/*.entity.{js,ts}'],
//   synchronize: true,
//   logging: false,
//   namingStrategy: new SnakeNamingStrategy(),
//   maxQueryExecutionTime: 300000,
//   cache: true,
//   migrationsTableName: 'migrations',
//   connectTimeoutMS: 0,
//   logNotifications: true
// }
