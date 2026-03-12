import { Ocupacion } from '@/application/personal/entities/ocupacion.entity'
import { Servicio } from '@/application/servicio/entities/servicio.entity'
import { ServicioOcupacion } from '@/application/servicio/entities/servicio-ocupacion.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { OcupacionEstado } from '@/application/personal/constants'
import { ServicioEstado } from '@/application/servicio/constants'
import { TipoCita } from '@/application/citas/constants'

export class ocupacionEstudio1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const ocupacionesBase = [
      {
        nombre: 'Cardiología',
        descripcion: 'Ocupacion enfocada en corazón y sistema vascular.',
        grado: 'Ocupacion médica',
      },
      {
        nombre: 'Neurología',
        descripcion: 'Ocupacion del sistema nervioso central y periférico.',
        grado: 'Ocupacion médica',
      },
      {
        nombre: 'Radiología',
        descripcion: 'Ocupacion orientada a imágenes diagnósticas.',
        grado: 'Ocupacion médica',
      },
      {
        nombre: 'Laboratorio Clínico',
        descripcion: 'Ocupacion para análisis clínicos y biomarcadores.',
        grado: 'Área técnica',
      },
      {
        nombre: 'Nutrición',
        descripcion: 'Evaluación y manejo nutricional integral.',
        grado: 'Licenciatura',
      },
    ]

    const ocupaciones = await queryRunner.manager.save(
      ocupacionesBase.map((item) =>
        queryRunner.manager.create(Ocupacion, {
          ...item,
          estado: OcupacionEstado.ACTIVO,
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const ocupacionPorNombre = new Map(
      ocupaciones.map((ocupacion) => [ocupacion.nombre, ocupacion])
    )

    const serviciosBase = [
      {
        nombre: 'Consulta General',
        descripcion: 'Consulta médica de primera valoración.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 30,
        costo: 120.5,
        ocupaciones: [],
      },
      {
        nombre: 'Control Nutricional',
        descripcion: 'Seguimiento de plan alimentario y hábitos.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 25,
        costo: 90.0,
        ocupaciones: ['Nutrición'],
      },
      {
        nombre: 'Electrocardiograma',
        descripcion: 'Registro de actividad eléctrica cardiaca.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 20,
        costo: 150.75,
        ocupaciones: ['Cardiología'],
      },
      {
        nombre: 'Tomografía Cerebral',
        descripcion: 'Estudio por imágenes para evaluación neurológica.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 45,
        costo: 480.25,
        ocupaciones: ['Neurología', 'Radiología'],
      },
      {
        nombre: 'Resonancia de Columna',
        descripcion: 'Imágenes de alta precisión de columna vertebral.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 60,
        costo: 620.9,
        ocupaciones: ['Radiología'],
      },
      {
        nombre: 'Perfil Lipídico',
        descripcion: 'Análisis de colesterol total y fracciones.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 15,
        costo: 80.4,
        ocupaciones: ['Laboratorio Clínico'],
      },
      {
        nombre: 'Consulta de Neurología',
        descripcion: 'Atención clínica para síntomas neurológicos.',
        tipo: TipoCita.CONSULTA,
        duracionMinutos: 35,
        costo: 210.0,
        ocupaciones: ['Neurología'],
      },
      {
        nombre: 'Eco Doppler Cardíaco',
        descripcion: 'Evaluación ecográfica del flujo sanguíneo cardíaco.',
        tipo: TipoCita.ESTUDIO,
        duracionMinutos: 40,
        costo: 320.6,
        ocupaciones: ['Cardiología'],
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

      return item.ocupaciones
        .map((nombreOcupacion) => {
          const ocupacion = ocupacionPorNombre.get(nombreOcupacion)
          if (!ocupacion) {
            return null
          }

          return queryRunner.manager.create(ServicioOcupacion, {
            servicioId: servicio.id,
            ocupacionId: ocupacion.id,
            usuarioCreacion: USUARIO_SISTEMA,
          })
        })
        .filter((relacion): relacion is ServicioOcupacion => relacion !== null)
    })

    if (relaciones.length > 0) {
      await queryRunner.manager.save(ServicioOcupacion, relaciones)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(ServicioOcupacion, {})
    await queryRunner.manager.delete(Servicio, {})
    await queryRunner.manager.delete(Ocupacion, {})
  }
}
