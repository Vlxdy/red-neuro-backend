import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { LoggerService, SQLLogger } from './src/core/logger'

dotenv.config()

const SeedDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: process.env.DB_SCHEMA,
  synchronize: false,
  logger: new SQLLogger({
    logger: LoggerService.getInstance(),
    level: {
      query: true,
      error: true,
    },
  }),
  logging: true,
  entities: ['src/**/*.entity.ts'],
  migrations: ['database/seeds/*.ts'],
})

export default SeedDataSource
