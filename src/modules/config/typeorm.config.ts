import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { off } from "process";
const SnakeNamingStrategy = require("typeorm-naming-strategies")
  .SnakeNamingStrategy;

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "iaadserver.postgres.database.azure.com",
  port: 5432,
  username: "iaadadmin",
  password: "EAQTzD6HEQ8eKb5AAyhNUZdC6k3NRkKgJxHFQzXD",
  database: "iaad-customer",
  entities: [__dirname + "dist/../**/*.entity.{js,ts}"],
  synchronize: false,
  logging: false,
  namingStrategy: new SnakeNamingStrategy(),
  maxQueryExecutionTime: 300000,
  cache: false,
  migrationsTableName: "migrations",
  connectTimeoutMS: 0,
  logNotifications: true,
  ssl: true
}

  // export const typeOrmConfig: TypeOrmModuleOptions = {
  //   type: 'postgres',
  //   host: 'localhost',
  //   port: 5432,
  //   username: 'postgres',
  //   password: 'p@55w0rd',
  //   database: 'iaad-customer',
  //   entities: [__dirname + 'dist/../**/*.entity.{js,ts}'],
  //   synchronize: false,
  //   logging: false,
  //   namingStrategy: new SnakeNamingStrategy(),
  //   maxQueryExecutionTime: 300000,
  //   cache: true,
  //   migrationsTableName: 'migrations',
  //   connectTimeoutMS: 0,
  //   logNotifications: true
  // }

