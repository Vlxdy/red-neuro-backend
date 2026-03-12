import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Servicio } from './entities/servicio.entity'
import { ServicioCategoria } from './entities/servicio-categoria.entity'
import { Categoria } from './entities/categoria.entity'
import { ServicioRepository } from './repository/servicio.repository'
import { ServicioService } from './services/servicio.service'
import { ServicioController } from './controllers/servicio.controller'
import { CategoriaRepository } from './repository/categoria.repository'
import { CategoriaService } from './services/categoria.service'
import { CategoriaController } from './controllers/categoria.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, ServicioCategoria, Categoria])],
  providers: [
    ServicioRepository,
    ServicioService,
    CategoriaRepository,
    CategoriaService,
  ],
  controllers: [ServicioController, CategoriaController],
})
export class ServicioModule {}
