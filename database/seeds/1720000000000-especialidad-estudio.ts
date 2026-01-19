import { Especialidad } from '@/application/personal/entities/especialidad.entity'
import { Estudio } from '@/application/estudio/entities/estudio.entity'
import { EstudioEspecialidad } from '@/application/estudio/entities/estudio-especialidad.entity'
import { USUARIO_SISTEMA } from '@/common/constants'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class especialidadEstudio1720000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const especialidades = [
      {
        nombre: 'Cardiología',
        descripcion: 'Especialidad enfocada en el corazón y el sistema vascular.',
        colorHex: '#E53935',
      },
      {
        nombre: 'Neurología',
        descripcion: 'Especialidad dedicada al sistema nervioso central y periférico.',
        colorHex: '#3949AB',
      },
      {
        nombre: 'Radiología',
        descripcion: 'Especialidad que realiza estudios por imágenes diagnósticas.',
        colorHex: '#00897B',
      },
      {
        nombre: 'Laboratorio Clínico',
        descripcion: 'Especialidad encargada de análisis clínicos y biomarcadores.',
        colorHex: '#6D4C41',
      },
    ]

    const especialidadesGuardadas = await queryRunner.manager.save(
      especialidades.map((item) =>
        queryRunner.manager.create(Especialidad, {
          nombre: item.nombre,
          descripcion: item.descripcion,
          colorHex: item.colorHex,
          estado: 'ACTIVO',
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const estudios = [
      {
        nombre: 'Electrocardiograma',
        descripcion: 'Registro de la actividad eléctrica del corazón.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Resonancia Magnética',
        descripcion: 'Estudio por imagen para tejidos blandos y sistema nervioso.',
        duracionMinutos: 60,
      },
      {
        nombre: 'Tomografía Computarizada',
        descripcion: 'Estudio por imagen en cortes para evaluación diagnóstica.',
        duracionMinutos: 45,
      },
      {
        nombre: 'Hemograma Completo',
        descripcion: 'Análisis de componentes sanguíneos básicos.',
        duracionMinutos: 15,
      },
    ]

    const estudiosGuardados = await queryRunner.manager.save(
      estudios.map((item) =>
        queryRunner.manager.create(Estudio, {
          nombre: item.nombre,
          descripcion: item.descripcion,
          duracionMinutos: item.duracionMinutos,
          estado: 'ACTIVO',
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )
    )

    const especialidadPorNombre = new Map(
      especialidadesGuardadas.map((especialidad) => [
        especialidad.nombre,
        especialidad,
      ])
    )
    const estudioPorNombre = new Map(
      estudiosGuardados.map((estudio) => [estudio.nombre, estudio])
    )

    const relaciones = [
      {
        especialidad: 'Cardiología',
        estudio: 'Electrocardiograma',
      },
      {
        especialidad: 'Neurología',
        estudio: 'Resonancia Magnética',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Resonancia Magnética',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Tomografía Computarizada',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Hemograma Completo',
      },
    ]

    const relacionesGuardadas = relaciones.map((relacion) => {
      const especialidad = especialidadPorNombre.get(relacion.especialidad)
      const estudio = estudioPorNombre.get(relacion.estudio)

      if (!especialidad || !estudio) {
        throw new Error(
          `Relación inválida: ${relacion.especialidad} - ${relacion.estudio}`
        )
      }

      return queryRunner.manager.create(EstudioEspecialidad, {
        especialidad,
        especialidadId: especialidad.id,
        estudio,
        estudioId: estudio.id,
      })
    })

    await queryRunner.manager.save(relacionesGuardadas)
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
