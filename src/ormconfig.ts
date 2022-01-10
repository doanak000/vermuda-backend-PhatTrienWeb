import * as dotenv from "dotenv";
dotenv.config();
import { ConnectionOptions } from "typeorm";
import * as functions from "firebase-functions";

const ormconfig: ConnectionOptions = {
  name: "default",
  type: "mysql",
  database: process.env.DB_DATABASE || functions.config().DB_DATABASE,
  host: process.env.DB_HOST || functions.config().DB_HOST,
  username: process.env.DB_USER || functions.config().DB_USER,
  password: process.env.DB_PASSWORD || functions.config().DB_PASSWORD,
  port: +process.env.DB_PORT || functions.config().DB_PORT,
  synchronize: true,
  entities: [__dirname + "/common/entities/*.entity{.ts,.js}"],
  migrationsRun: false,
  migrations: [__dirname + "/database/migration/*{.ts,.js}"],
  cli: {
    migrationsDir: "src/database/migration",
  },
  logging: false,
};

export = ormconfig;
