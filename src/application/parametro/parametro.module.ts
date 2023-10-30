import { Module } from '@nestjs/common'
import { ParametroController } from './controller'
import { ParametroService } from './service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ParametroRepository } from './repository'
import { Parametro } from './entity'

@Module({
  controllers: [ParametroController],
  providers: [ParametroService, ParametroRepository],
  imports: [TypeOrmModule.forFeature([Parametro])],
})
export class ParametroModule {}
