import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Lugar } from './entities/lugar.entity'
import { LugarRepository } from './repository/lugar.repository'
import { LugarService } from './services/lugar.service'
import { LugarController } from './controllers/lugar.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Lugar])],
  providers: [LugarRepository, LugarService],
  controllers: [LugarController],
})
export class LugarModule {}
