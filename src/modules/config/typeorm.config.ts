import { TypeOrmModuleOptions } from "@nestjs/typeorm";
const SnakeNamingStrategy = require("typeorm-naming-strategies")
  .SnakeNamingStrategy;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "iaad-database.postgres.database.azure.com",
  port: 5432,
  username: "iaaddatabaseadmin@iaad-database",
  password: "7j;mb:vf-;@a,H3QLm;Dxn*!tU`#pr@uW+WG=<S?",
  database: "iaad-customer",
  entities: [__dirname + "dist/../**/*.entity.{js,ts}"],
  synchronize: true,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  maxQueryExecutionTime: 300000,
  cache: false,
  migrationsTableName: "migrations",
  connectTimeoutMS: 0,
  logNotifications: true
}