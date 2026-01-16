import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Estudio } from './entities/estudio.entity'
import { EstudioEspecialidad } from './entities/estudio-especialidad.entity'
import { EstudioRepository } from './repository/estudio.repository'
import { EstudioService } from './services/estudio.service'
import { EstudioController } from './controllers/estudio.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Estudio, EstudioEspecialidad])],
  providers: [EstudioRepository, EstudioService],
  controllers: [EstudioController],
})
export class EstudioModule {}
