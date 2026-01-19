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
      {
        nombre: 'Ginecología',
        descripcion: 'Especialidad enfocada en la salud reproductiva femenina.',
        colorHex: '#EC407A',
      },
      {
        nombre: 'Pediatría',
        descripcion: 'Atención médica de niñas, niños y adolescentes.',
        colorHex: '#42A5F5',
      },
      {
        nombre: 'Endocrinología',
        descripcion: 'Diagnóstico y tratamiento de trastornos hormonales.',
        colorHex: '#7E57C2',
      },
      {
        nombre: 'Gastroenterología',
        descripcion: 'Especialidad del sistema digestivo y sus órganos.',
        colorHex: '#8D6E63',
      },
      {
        nombre: 'Dermatología',
        descripcion: 'Enfermedades de la piel, cabello y uñas.',
        colorHex: '#F06292',
      },
      {
        nombre: 'Oftalmología',
        descripcion: 'Salud visual y patologías oculares.',
        colorHex: '#26A69A',
      },
      {
        nombre: 'Otorrinolaringología',
        descripcion: 'Diagnóstico de oídos, nariz y garganta.',
        colorHex: '#FF7043',
      },
      {
        nombre: 'Traumatología',
        descripcion: 'Especialidad de lesiones del sistema músculo-esquelético.',
        colorHex: '#78909C',
      },
      {
        nombre: 'Nefrología',
        descripcion: 'Atención de enfermedades renales.',
        colorHex: '#5C6BC0',
      },
      {
        nombre: 'Neumología',
        descripcion: 'Enfermedades del aparato respiratorio.',
        colorHex: '#29B6F6',
      },
      {
        nombre: 'Oncología',
        descripcion: 'Diagnóstico y tratamiento del cáncer.',
        colorHex: '#AB47BC',
      },
      {
        nombre: 'Reumatología',
        descripcion: 'Patologías inflamatorias y autoinmunes.',
        colorHex: '#66BB6A',
      },
      {
        nombre: 'Psiquiatría',
        descripcion: 'Salud mental y trastornos psiquiátricos.',
        colorHex: '#8E24AA',
      },
      {
        nombre: 'Nutrición',
        descripcion: 'Evaluación y manejo nutricional integral.',
        colorHex: '#9CCC65',
      },
      {
        nombre: 'Medicina Interna',
        descripcion: 'Atención integral de adultos con múltiples patologías.',
        colorHex: '#546E7A',
      },
      {
        nombre: 'Urología',
        descripcion: 'Salud del sistema urinario y reproductor masculino.',
        colorHex: '#26C6DA',
      },
      {
        nombre: 'Hematología',
        descripcion: 'Diagnóstico de enfermedades de la sangre.',
        colorHex: '#EF5350',
      },
      {
        nombre: 'Infectología',
        descripcion: 'Prevención y tratamiento de infecciones.',
        colorHex: '#8BC34A',
      },
      {
        nombre: 'Medicina Familiar',
        descripcion: 'Atención primaria centrada en la familia.',
        colorHex: '#81C784',
      },
      {
        nombre: 'Medicina Deportiva',
        descripcion: 'Prevención y recuperación de lesiones deportivas.',
        colorHex: '#FFB300',
      },
      {
        nombre: 'Anestesiología',
        descripcion: 'Manejo del dolor y cuidados anestésicos.',
        colorHex: '#BDBDBD',
      },
      {
        nombre: 'Alergología',
        descripcion: 'Diagnóstico y manejo de alergias e inmunología clínica.',
        colorHex: '#AED581',
      },
      {
        nombre: 'Medicina Física y Rehabilitación',
        descripcion: 'Recuperación funcional y rehabilitación.',
        colorHex: '#90CAF9',
      },
      {
        nombre: 'Cirugía General',
        descripcion: 'Procedimientos quirúrgicos de amplio espectro.',
        colorHex: '#FF8A65',
      },
      {
        nombre: 'Radioterapia',
        descripcion: 'Tratamientos oncológicos con radiación.',
        colorHex: '#BA68C8',
      },
      {
        nombre: 'Imagenología',
        descripcion: 'Interpretación diagnóstica de imágenes médicas.',
        colorHex: '#4DB6AC',
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
        nombre: 'Ecocardiograma',
        descripcion: 'Evaluación por ultrasonido del corazón.',
        duracionMinutos: 40,
      },
      {
        nombre: 'Prueba de Esfuerzo',
        descripcion: 'Evaluación cardiovascular bajo esfuerzo controlado.',
        duracionMinutos: 45,
      },
      {
        nombre: 'Resonancia Magnética',
        descripcion: 'Estudio por imagen para tejidos blandos y sistema nervioso.',
        duracionMinutos: 60,
      },
      {
        nombre: 'Resonancia Magnética de Columna',
        descripcion: 'Evaluación de discos y estructuras vertebrales.',
        duracionMinutos: 60,
      },
      {
        nombre: 'Tomografía Computarizada',
        descripcion: 'Estudio por imagen en cortes para evaluación diagnóstica.',
        duracionMinutos: 45,
      },
      {
        nombre: 'Tomografía de Tórax',
        descripcion: 'Imagenología de tórax y pulmones.',
        duracionMinutos: 35,
      },
      {
        nombre: 'Radiografía de Tórax',
        descripcion: 'Estudio básico de pulmones y corazón.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Radiografía de Columna',
        descripcion: 'Evaluación ósea de la columna vertebral.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Ultrasonido Abdominal',
        descripcion: 'Evaluación de órganos abdominales.',
        duracionMinutos: 30,
      },
      {
        nombre: 'Ultrasonido Obstétrico',
        descripcion: 'Control del desarrollo fetal durante el embarazo.',
        duracionMinutos: 30,
      },
      {
        nombre: 'Doppler Vascular',
        descripcion: 'Evaluación del flujo sanguíneo en vasos.',
        duracionMinutos: 35,
      },
      {
        nombre: 'Hemograma Completo',
        descripcion: 'Análisis de componentes sanguíneos básicos.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Perfil Lipídico',
        descripcion: 'Medición de colesterol y triglicéridos.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Perfil Hepático',
        descripcion: 'Evaluación de la función del hígado.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Perfil Renal',
        descripcion: 'Evaluación de la función renal.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Glucosa en Ayunas',
        descripcion: 'Medición de glucosa basal.',
        duracionMinutos: 10,
      },
      {
        nombre: 'Hemoglobina Glicosilada',
        descripcion: 'Control de glucosa a largo plazo.',
        duracionMinutos: 15,
      },
      {
        nombre: 'TSH',
        descripcion: 'Evaluación de función tiroidea.',
        duracionMinutos: 15,
      },
      {
        nombre: 'T4 Libre',
        descripcion: 'Medición de hormona tiroidea libre.',
        duracionMinutos: 15,
      },
      {
        nombre: 'PSA',
        descripcion: 'Marcador prostático específico.',
        duracionMinutos: 15,
      },
      {
        nombre: 'Citología Cervical',
        descripcion: 'Tamizaje de lesiones cervicales.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Colposcopía',
        descripcion: 'Evaluación detallada del cuello uterino.',
        duracionMinutos: 30,
      },
      {
        nombre: 'Espirometría',
        descripcion: 'Prueba de función pulmonar.',
        duracionMinutos: 25,
      },
      {
        nombre: 'Prueba de Alergia Cutánea',
        descripcion: 'Detección de alérgenos comunes.',
        duracionMinutos: 30,
      },
      {
        nombre: 'Audiometría',
        descripcion: 'Evaluación de la capacidad auditiva.',
        duracionMinutos: 25,
      },
      {
        nombre: 'Otometría',
        descripcion: 'Medición de la presión en el oído medio.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Campimetría',
        descripcion: 'Evaluación del campo visual.',
        duracionMinutos: 25,
      },
      {
        nombre: 'Fondo de Ojo',
        descripcion: 'Exploración de retina y nervio óptico.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Densitometría Ósea',
        descripcion: 'Medición de densidad mineral ósea.',
        duracionMinutos: 25,
      },
      {
        nombre: 'Evaluación Nutricional',
        descripcion: 'Valoración antropométrica y dietética.',
        duracionMinutos: 40,
      },
      {
        nombre: 'Test de Función Hepática Avanzado',
        descripcion: 'Panel completo de función hepática.',
        duracionMinutos: 20,
      },
      {
        nombre: 'Biopsia Cutánea',
        descripcion: 'Muestra de piel para análisis histológico.',
        duracionMinutos: 30,
      },
      {
        nombre: 'Electromiografía',
        descripcion: 'Evaluación de la conducción neuromuscular.',
        duracionMinutos: 45,
      },
      {
        nombre: 'Electroencefalograma',
        descripcion: 'Registro de actividad eléctrica cerebral.',
        duracionMinutos: 40,
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
        especialidad: 'Cardiología',
        estudio: 'Ecocardiograma',
      },
      {
        especialidad: 'Cardiología',
        estudio: 'Prueba de Esfuerzo',
      },
      {
        especialidad: 'Neurología',
        estudio: 'Resonancia Magnética',
      },
      {
        especialidad: 'Neurología',
        estudio: 'Resonancia Magnética de Columna',
      },
      {
        especialidad: 'Neurología',
        estudio: 'Electroencefalograma',
      },
      {
        especialidad: 'Neurología',
        estudio: 'Electromiografía',
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
        especialidad: 'Radiología',
        estudio: 'Tomografía de Tórax',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Radiografía de Tórax',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Radiografía de Columna',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Ultrasonido Abdominal',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Ultrasonido Obstétrico',
      },
      {
        especialidad: 'Radiología',
        estudio: 'Doppler Vascular',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Hemograma Completo',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Perfil Lipídico',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Perfil Hepático',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Perfil Renal',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Glucosa en Ayunas',
      },
      {
        especialidad: 'Laboratorio Clínico',
        estudio: 'Hemoglobina Glicosilada',
      },
      {
        especialidad: 'Endocrinología',
        estudio: 'TSH',
      },
      {
        especialidad: 'Endocrinología',
        estudio: 'T4 Libre',
      },
      {
        especialidad: 'Urología',
        estudio: 'PSA',
      },
      {
        especialidad: 'Ginecología',
        estudio: 'Citología Cervical',
      },
      {
        especialidad: 'Ginecología',
        estudio: 'Colposcopía',
      },
      {
        especialidad: 'Neumología',
        estudio: 'Espirometría',
      },
      {
        especialidad: 'Alergología',
        estudio: 'Prueba de Alergia Cutánea',
      },
      {
        especialidad: 'Otorrinolaringología',
        estudio: 'Audiometría',
      },
      {
        especialidad: 'Otorrinolaringología',
        estudio: 'Otometría',
      },
      {
        especialidad: 'Oftalmología',
        estudio: 'Campimetría',
      },
      {
        especialidad: 'Oftalmología',
        estudio: 'Fondo de Ojo',
      },
      {
        especialidad: 'Traumatología',
        estudio: 'Densitometría Ósea',
      },
      {
        especialidad: 'Nutrición',
        estudio: 'Evaluación Nutricional',
      },
      {
        especialidad: 'Gastroenterología',
        estudio: 'Test de Función Hepática Avanzado',
      },
      {
        especialidad: 'Dermatología',
        estudio: 'Biopsia Cutánea',
      },
      {
        especialidad: 'Imagenología',
        estudio: 'Tomografía Computarizada',
      },
      {
        especialidad: 'Imagenología',
        estudio: 'Resonancia Magnética',
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
