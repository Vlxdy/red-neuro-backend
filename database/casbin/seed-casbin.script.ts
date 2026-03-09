import 'reflect-metadata'
import AppDataSource from '../../ormconfig-seed'
import { runCasbinSeed } from 'database/casbin/casbin.data'

async function main() {
  await AppDataSource.initialize()

  const queryRunner = AppDataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    await runCasbinSeed(queryRunner)
    await queryRunner.commitTransaction()
    console.log('✅ Seed Casbin ejecutado correctamente')
  } catch (error) {
    await queryRunner.rollbackTransaction()
    console.error('❌ Error al ejecutar seed Casbin:', error)
    process.exit(1)
  } finally {
    await queryRunner.release()
    await AppDataSource.destroy()
  }
}

void main()
