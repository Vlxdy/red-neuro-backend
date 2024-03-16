import { Module } from '@nestjs/common'
import { ParametroController } from '@/application/parametro/controller/parametro.controller'
import { ParametroService } from '@/application/parametro/service/parametro.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ParametroRepository } from '@/application/parametro/repository/parametro.repository'
import { Parametro } from '@/application/parametro/entity/parametro.entity'

@Module({
  controllers: [ParametroController],
  providers: [ParametroService, ParametroRepository],
  imports: [TypeOrmModule.forFeature([Parametro])],
})
export class ParametroModule {}
