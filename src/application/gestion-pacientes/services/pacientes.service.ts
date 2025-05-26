import { BaseService } from '@/common/base/base-service'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repositories/usuarios-registrados.repository'

import {
  PacientesAsignadosDto,
  UsuariosRegistradosResponse,
} from '../dto/usuarios-registrados.dto'
import { formatearUsuariosRolesRespuesta } from '../utils/formateos'
import { PrinterService } from '@/printer/printer.service'
import {
  Content,
  DynamicContent,
  TDocumentDefinitions,
} from 'pdfmake/interfaces'
import { DateService } from '@/common/lib/data.service'

@Injectable()
export class PacientesService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository,
    private printerService: PrinterService
  ) {
    super()
  }

  async obtenerPaciente(idUsuarioRol: string, transaccion?: EntityManager) {
    const usuarioRol = await this.usuarioRolRepositorio.buscarPorId(
      idUsuarioRol,
      transaccion
    )
    if (!usuarioRol) {
      throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
    }
    if (usuarioRol.rol.rol === RolEnum.PACIENTE) return usuarioRol
    throw new NotFoundException(Messages.PACIENTE_NOT_FOUND)
  }

  async listarPacientePorMedico(
    params: PacientesAsignadosDto,
    idMedico: string
  ): Promise<[UsuariosRegistradosResponse[], number]> {
    const { todos } = params
    const [usuariosRol, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorMedico(
        idMedico,
        params,
        todos
      )
    return [formatearUsuariosRolesRespuesta(usuariosRol), total]
  }

  async listarPacientesPorAsignar({
    idMedico,
    params,
  }: {
    params: PaginacionQueryDto
    idMedico: string
  }): Promise<[UsuariosRegistradosResponse[], number]> {
    const [uduarios, total] =
      await this.usuarioRegistradoRepositorio.listarPacientesPorAsignar({
        idPacientesOmitir: [idMedico],
        params,
      })

    return [formatearUsuariosRolesRespuesta(uduarios), total]
  }

  async listarPacientes(
    params: PaginacionQueryDto
  ): Promise<[UsuariosRegistradosResponse[], number]> {
    const [usuariosRol, total] =
      await this.usuarioRegistradoRepositorio.listarPacientes(params)
    return [formatearUsuariosRolesRespuesta(usuariosRol), total]
  }

  async ReportePaciente(usuarioAuditoria: string, idPasiente: string) {
    const paciente = await this.obtenerPaciente(idPasiente)
    console.log('esto esta en pacientes', paciente)
    const personaPaciente = paciente.usuario.persona

    const header: DynamicContent | Content | undefined = {
      text: 'Consultorio Nutricional',
      alignment: 'right',
      margin: [10, 10],
    }

    const logo: Content = {
      image: 'public/alimenta/logoAlimenta.jpeg',
      width: 80,
    }

    const infoConsultorio: Content = [
      {
        marginTop: 10,
        columns: [
          {
            text: 'Alimenta',
            style: { fontSize: 20, color: '#e99539' },
            bold: true,
          },
          {
            text: `Fecha de Reporte`,
            bold: true,
            alignment: 'right',
          },
        ],
      },
      {
        columns: [
          {
            text: 'Tu cuerpo, tu mente y tu alma',
            color: '#e99539',
          },
          {
            text: `${DateService.fechaActual()}`,
            alignment: 'right',
          },
        ],
      },
    ]

    const DatosPaciente: Content = [
      {
        margin: [0, 10, 0, 5],
        columns: [
          {
            text: [
              { text: 'Paciente: ', bold: true },
              {
                text: `${personaPaciente.nombres} ${personaPaciente.primerApellido ?? ''} ${personaPaciente.segundoApellido ?? ''}`,
              },
            ],
          },
          {
            text: [{ text: 'Peso:', bold: true }, { text: '67 kg' }],
            alignment: 'right',
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { text: `Nro Documento: `, bold: true },
              { text: `${personaPaciente.nroDocumento}` },
            ],
          },
          {
            text: [{ text: 'Grasa Muscular:', bold: true }, { text: '10%' }],
            alignment: 'right',
          },
        ],
      },
      {
        columns: [
          {
            text: [
              { text: `Edad: `, bold: true },
              {
                text: `${DateService.calculateAge(personaPaciente.fechaNacimiento)}`,
              },
            ],
          },
          {
            text: [{ text: 'IMC:', bold: true }, { text: '22.5' }],
            alignment: 'right',
          },
        ],
      },
    ]

    // Datos de citas clínicas (10 registros ficticios)
    const citasClinicas = this.generarCitasClinicas(personaPaciente.nombres)
    const recomendaciones = this.generarRecomendacionesPorCita()
    const contenido: TDocumentDefinitions = {
      header: header,
      content: [
        logo,
        infoConsultorio,
        DatosPaciente,
        {
          text: 'Historial de Citas Clínicas',
          marginTop: 10,
          bold: true,
          fontSize: 15,
        },
        citasClinicas,
        {
          text: 'Recomendaciones Nutricionales',
          marginTop: 10,
          bold: true,
          fontSize: 15,
        },
        recomendaciones,
      ],
      defaultStyle: { font: 'Helvetica' },
    }

    const pdf = await this.printerService.crearPDF(contenido)
    pdf.info.Title = 'Reporte Paciente'
    return pdf
  }

  // Método para generar citas clínicas ficticias
  private generarCitasClinicas(nombrePaciente: string): Content[] {
    const citas: Content[] = []
    const fechas = [
      '2023-01-15',
      '2023-02-20',
      '2023-03-10',
      '2023-04-05',
      '2023-05-15',
      '2023-06-25',
      '2023-07-30',
      '2023-08-10',
      '2023-09-15',
      '2023-10-20',
    ]

    // Encabezados de la tabla
    const encabezados = [
      { text: 'Fecha', bold: true },
      { text: 'Peso (kg)', bold: true },
      { text: 'Grasa Corporal (%)', bold: true },
      { text: 'IMC', bold: true },
      { text: 'Observaciones', bold: true },
    ]

    // Agregar encabezados a la tabla
    citas.push({
      table: {
        widths: ['*', 'auto', 'auto', 'auto', '*'],
        body: [
          encabezados,
          // Datos de las citas
          ...fechas.map((fecha) => {
            // Generar datos ficticios para cada cita
            const peso = Math.floor(Math.random() * (80 - 60 + 1)) + 60 // Peso entre 60 y 80 kg
            const grasaCorporal = Math.floor(Math.random() * (30 - 10 + 1)) + 10 // Grasa corporal entre 10% y 30%
            const imc = (peso / Math.pow(1.75, 2)).toFixed(2) // Suponiendo una altura de 1.75 m
            const observaciones = 'Consulta realizada con éxito.'

            return [
              { text: fecha },
              { text: peso.toString() },
              { text: grasaCorporal.toString() },
              { text: imc },
              { text: observaciones },
            ]
          }),
        ],
      },
      layout: 'lightHorizontalLines', // Estilo de la tabla
      margin: [0, 10],
    })

    return citas
  }
  private generarRecomendacionesPorCita(): Content {
    const recomendaciones = [
      {
        fecha: '2023-01-15',
        detalles: [
          'Aumentar la ingesta de frutas y verduras.',
          'Incluir al menos 5 porciones de frutas y verduras al día.',
          'Optar por frutas y verduras de temporada.',
        ],
      },
      {
        fecha: '2023-02-20',
        detalles: [
          'Mantener una hidratación adecuada.',
          'Beber al menos 2 litros de agua al día.',
          'Evitar bebidas azucaradas y alcohólicas.',
        ],
      },
      {
        fecha: '2023-03-10',
        detalles: [
          'Realizar actividad física al menos 3 veces por semana.',
          'Incluir ejercicios de fuerza y resistencia.',
          'Considerar actividades que disfrutes, como bailar o nadar.',
        ],
      },
      {
        fecha: '2023-04-05',
        detalles: [
          'Evitar el consumo excesivo de azúcares y grasas saturadas.',
          'Leer las etiquetas de los alimentos para identificar azúcares ocultos.',
          'Sustituir snacks procesados por opciones saludables.',
        ],
      },
      {
        fecha: '2023-05-15',
        detalles: [
          'Consultar regularmente con el nutricionista.',
          'Programar citas de seguimiento cada 3 meses.',
          'Discutir cualquier cambio en tu salud o dieta.',
        ],
      },
    ]

    // Crear la tabla
    const tableBody: Content[][] = [
      [
        { text: 'Fecha', bold: true, fillColor: '#e99539', color: '#ffffff' },
        {
          text: 'Recomendaciones',
          bold: true,
          fillColor: '#e99539',
          color: '#ffffff',
        },
      ],
    ]

    recomendaciones.forEach((recomendacion) => {
      const detalles = recomendacion.detalles.join('\n') // Unir detalles en una sola celda
      tableBody.push([{ text: recomendacion.fecha }, { text: detalles }])
    })

    return {
      table: {
        widths: ['auto', '*'], // Ajustar el ancho de las columnas
        body: tableBody,
      },
      layout: {
        hLineWidth: (i: number) => (i === 0 ? 0 : 1), // Línea horizontal solo después del encabezado
        vLineWidth: () => 0, // Sin líneas verticales
        hLineColor: () => '#cccccc', // Color de las líneas horizontales
        paddingLeft: () => 10, // Espaciado a la izquierda
        paddingRight: () => 10, // Espaciado a la derecha
        paddingTop: () => 5, // Espaciado arriba
        paddingBottom: () => 5, // Espaciado abajo
      },
      margin: [0, 10],
    }
  }
}
