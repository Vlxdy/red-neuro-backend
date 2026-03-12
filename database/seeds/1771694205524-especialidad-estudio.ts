import { Categoria } from '@/application/servicio/entities/categoria.entity'
import { Servicio } from '@/application/servicio/entities/servicio.entity'
import { ServicioCategoria } from '@/application/servicio/entities/servicio-categoria.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { ServicioEstado } from '@/application/servicio/constants'
import { TipoCita } from '@/application/citas/constants'

export class ocupacionEstudio1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const categoriasBase = [
      { nombre: 'Cardiología', descripcion: 'Categoría enfocada en corazón y sistema vascular.' },
      { nombre: 'Neurología', descripcion: 'Categoría del sistema nervioso central y periférico.' },
      { nombre: 'Radiología', descripcion: 'Categoría orientada a imágenes diagnósticas.' },
      { nombre: 'Laboratorio Clínico', descripcion: 'Categoría para análisis clínicos y biomarcadores.' },
      { nombre: 'Nutrición', descripcion: 'Evaluación y manejo nutricional integral.' },
    ]

    const categorias = await queryRunner.manager.save(
      categoriasBase.map((item) =>
        queryRunner.manager.create(Categoria, {
          ...item,
          estado: ServicioEstado.ACTIVO,
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const categoriaPorNombre = new Map(
      categorias.map((categoria) => [categoria.nombre, categoria])
    )

    const serviciosBase = [
      { nombre: 'Consulta General', descripcion: 'Consulta médica de primera valoración.', tipo: TipoCita.CONSULTA, duracionMinutos: 30, costo: 120.5, categorias: [] },
      { nombre: 'Control Nutricional', descripcion: 'Seguimiento de plan alimentario y hábitos.', tipo: TipoCita.CONSULTA, duracionMinutos: 25, costo: 90.0, categorias: ['Nutrición'] },
      { nombre: 'Electrocardiograma', descripcion: 'Registro de actividad eléctrica cardiaca.', tipo: TipoCita.ESTUDIO, duracionMinutos: 20, costo: 150.75, categorias: ['Cardiología'] },
    ]

    const servicios = await queryRunner.manager.save(
      serviciosBase.map((item) =>
        queryRunner.manager.create(Servicio, {
          nombre: item.nombre,
          descripcion: item.descripcion,
          tipo: item.tipo,
          duracionMinutos: item.duracionMinutos,
          costo: item.costo,
          estado: ServicioEstado.ACTIVO,
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const servicioPorNombre = new Map(
      servicios.map((servicio) => [servicio.nombre, servicio])
    )

    const relaciones = serviciosBase.flatMap((item) => {
      const servicio = servicioPorNombre.get(item.nombre)
      if (!servicio) return []

      return item.categorias
        .map((nombreCategoria) => {
          const categoria = categoriaPorNombre.get(nombreCategoria)
          if (!categoria) return null

          return queryRunner.manager.create(ServicioCategoria, {
            servicioId: servicio.id,
            categoriaId: categoria.id,
            usuarioCreacion: USUARIO_SISTEMA,
          })
        })
        .filter((relacion): relacion is ServicioCategoria => relacion !== null)
    })

    if (relaciones.length > 0) {
      await queryRunner.manager.save(ServicioCategoria, relaciones)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(ServicioCategoria, {})
    await queryRunner.manager.delete(Servicio, {})
    await queryRunner.manager.delete(Categoria, {})
  }
}
