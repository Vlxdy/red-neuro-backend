import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { Servicio } from '@/application/estudio/entities/estudio.entity'
import { ServicioEspecialidad } from '@/application/estudio/entities/estudio-especialidad.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { EspecialidadEstado } from '@/application/personal/constants'
import { ServicioEstado } from '@/application/estudio/constants'
import { TipoCita } from '@/application/citas/constants'

export class especialidadEstudio1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const especialidadesBase = [
      {
        nombre: 'Cardiología',
        descripcion: 'Especialidad enfocada en corazón y sistema vascular.',
        colorHex: '#E53935',
      },
      {
        nombre: 'Neurología',
        descripcion: 'Especialidad del sistema nervioso central y periférico.',
        colorHex: '#3949AB',
      },
      {
        nombre: 'Radiología',
        descripcion: 'Especialidad orientada a imágenes diagnósticas.',
        colorHex: '#00897B',
      },
      {
        nombre: 'Laboratorio Clínico',
        descripcion: 'Especialidad para análisis clínicos y biomarcadores.',
        colorHex: '#6D4C41',
      },
      {
        nombre: 'Nutrición',
        descripcion: 'Evaluación y manejo nutricional integral.',
        colorHex: '#9CCC65',
      },
    ]

    const especialidades = await queryRunner.manager.save(
      especialidadesBase.map((item) =>
        queryRunner.manager.create(Especialidad, {
          ...item,
          estado: EspecialidadEstado.ACTIVO,
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const especialidadPorNombre = new Map(
      especialidades.map((especialidad) => [especialidad.nombre, especialidad])
    )

    const serviciosBase = [
      {
        nombre: 'Consulta General',
        descripcion: 'Consulta médica de primera valoración.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 30,
        costo: 120.5,
        especialidades: [],
      },
      {
        nombre: 'Control Nutricional',
        descripcion: 'Seguimiento de plan alimentario y hábitos.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 25,
        costo: 90.0,
        especialidades: ['Nutrición'],
      },
      {
        nombre: 'Electrocardiograma',
        descripcion: 'Registro de actividad eléctrica cardiaca.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 20,
        costo: 150.75,
        especialidades: ['Cardiología'],
      },
      {
        nombre: 'Tomografía Cerebral',
        descripcion: 'Estudio por imágenes para evaluación neurológica.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 45,
        costo: 480.25,
        especialidades: ['Neurología', 'Radiología'],
      },
      {
        nombre: 'Resonancia de Columna',
        descripcion: 'Imágenes de alta precisión de columna vertebral.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 60,
        costo: 620.9,
        especialidades: ['Radiología'],
      },
      {
        nombre: 'Perfil Lipídico',
        descripcion: 'Análisis de colesterol total y fracciones.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 15,
        costo: 80.4,
        especialidades: ['Laboratorio Clínico'],
      },
      {
        nombre: 'Consulta de Neurología',
        descripcion: 'Atención clínica para síntomas neurológicos.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 35,
        costo: 210.0,
        especialidades: ['Neurología'],
      },
      {
        nombre: 'Eco Doppler Cardíaco',
        descripcion: 'Evaluación ecográfica del flujo sanguíneo cardíaco.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 40,
        costo: 320.6,
        especialidades: ['Cardiología'],
      },
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

      return item.especialidades
        .map((nombreEspecialidad) => {
          const especialidad = especialidadPorNombre.get(nombreEspecialidad)
          if (!especialidad) {
            return null
          }

          return queryRunner.manager.create(ServicioEspecialidad, {
            servicioId: servicio.id,
            especialidadId: especialidad.id,
          })
        })
        .filter(
          (relacion): relacion is ServicioEspecialidad => relacion !== null
        )
    })

    if (relaciones.length > 0) {
      await queryRunner.manager.save(ServicioEspecialidad, relaciones)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(ServicioEspecialidad, {})
    await queryRunner.manager.delete(Servicio, {})
    await queryRunner.manager.delete(Especialidad, {})
  }
}
