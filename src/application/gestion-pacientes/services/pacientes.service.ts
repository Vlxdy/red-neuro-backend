import { BaseService } from '@/common/base/base-service'
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { UsuarioRolRepository } from '@/core/authorization/repository/usuario-rol.repository'
import { RolEnum, RolEnumId } from '@/core/authorization/rol.enum'
import { Messages } from '@/common/constants/response-messages'
import { QueryEvaluacionesDto } from '@/application/historia-clinica/dtos/evaluacion.dto'
import { PaginacionQueryDto } from '@/common/dto/paginacion-query.dto'
import { UsuariosRegistradosRepository } from '../repositories/usuarios-registrados.repository'
import { UsuarioRepository } from '@/core/usuario/repository/usuario.repository'
import { PersonaRepository } from '@/core/usuario/repository/persona.repository'
import { AsignacionRepository } from '../repositories/asignacion.repository'

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
import { EvaluacionNutricionalService } from '@/application/historia-clinica/services/evaluacion-nutricional.service'
import { HistoriaClinicaService } from '@/application/historia-clinica/services/historia-clinico.service'
import { EvaluacionNutricionalResponde } from '@/common/types/data-response.type'
import dayjs from 'dayjs'
import { ActualizarDatosPersonalesPacienteDto } from '../dto/actualizar-datos-paciente.dto'
import {
  CrearPacienteDto,
  ActualizarPacienteDto,
} from '../dto/crear-paciente.dto'
import { TipoDocumento } from '@/common/constants'
import { TextService } from '@/common/lib/text.service'
import { UsuarioEstado } from '@/core/usuario/constant'

@Injectable()
export class PacientesService extends BaseService {
  constructor(
    @Inject(UsuarioRolRepository)
    private usuarioRolRepositorio: UsuarioRolRepository,
    private usuarioRegistradoRepositorio: UsuariosRegistradosRepository,
    private printerService: PrinterService,
    private usuarioRepositorio: UsuarioRepository,
    private personaRepositorio: PersonaRepository,
    private asignacionRepositorio: AsignacionRepository,
    @Inject(forwardRef(() => EvaluacionNutricionalService))
    private evaluacionesNutricionalesService: EvaluacionNutricionalService,
    @Inject(forwardRef(() => HistoriaClinicaService))
    private historiaClinicaService: HistoriaClinicaService
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

  async crearPaciente({
    datos,
    idUsuarioRol,
    usuarioAuditoria,
  }: {
    datos: CrearPacienteDto
    idUsuarioRol: string
    usuarioAuditoria: string
  }) {
    const actor = await this.usuarioRolRepositorio.buscarPorId(idUsuarioRol)

    if (
      !actor ||
      !(
        actor.rol.rol === RolEnum.ADMINISTRADOR ||
        actor.rol.rol === RolEnum.NUTRICIONISTA
      )
    ) {
      throw new ForbiddenException(Messages.EXCEPTION_FORBIDDEN)
    }

    const { persona, repetirContrasena: _, ...datosUsuario } = datos
    void _

    const personaPaciente = {
      ...persona,
      tipoDocumento: persona.tipoDocumento ?? TipoDocumento.CI,
    }

    const usuarioExistente = await this.usuarioRepositorio.buscarUsuarioPorCI(
      personaPaciente.nroDocumento
    )

    if (usuarioExistente) {
      throw new PreconditionFailedException(Messages.EXISTING_USER)
    }

    const correoExistente =
      await this.usuarioRepositorio.buscarUsuarioPorCorreo(
        datosUsuario.correoElectronico
      )

    if (correoExistente) {
      throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
    }

    if (datosUsuario.usuario) {
      const usuarioRegistrado = await this.usuarioRepositorio.buscarUsuario(
        datosUsuario.usuario
      )

      if (usuarioRegistrado) {
        throw new PreconditionFailedException(Messages.EXISTING_USER)
      }
    }

    if (personaPaciente.telefono) {
      const telefonoExistente =
        await this.personaRepositorio.buscarPersonaPorTelefono(
          personaPaciente.telefono
        )

      if (telefonoExistente) {
        throw new PreconditionFailedException(Messages.EXISTING_PHONE)
      }
    }

    const contrasenaEncriptada = await TextService.encrypt(
      datosUsuario.contrasena
    )

    const op = async (transaction: EntityManager) => {
      const nuevaPersona = await this.personaRepositorio.crear(
        personaPaciente,
        usuarioAuditoria,
        transaction
      )

      const nuevoUsuario = await this.usuarioRepositorio.crear(
        nuevaPersona.id,
        {
          usuario: datosUsuario.usuario ?? personaPaciente.nroDocumento,
          estado: UsuarioEstado.ACTIVE,
          correoElectronico: datosUsuario.correoElectronico,
          contrasena: contrasenaEncriptada,
        },
        usuarioAuditoria,
        transaction
      )

      await this.usuarioRolRepositorio.crear(
        nuevoUsuario.id,
        [RolEnumId.PACIENTE],
        usuarioAuditoria,
        transaction
      )

      return nuevoUsuario
    }

    const usuarioCreado = await this.usuarioRepositorio.runTransaction(op)

    return { id: usuarioCreado.id, estado: usuarioCreado.estado }
  }

  async actualizarPaciente({
    idPaciente,
    datos,
    idUsuarioRol,
    usuarioAuditoria,
  }: {
    idPaciente: string
    datos: ActualizarPacienteDto
    idUsuarioRol: string
    usuarioAuditoria: string
  }) {
    const actor = await this.usuarioRolRepositorio.buscarPorId(idUsuarioRol)

    if (
      !actor ||
      !(
        actor.rol.rol === RolEnum.ADMINISTRADOR ||
        actor.rol.rol === RolEnum.NUTRICIONISTA
      )
    ) {
      throw new ForbiddenException(Messages.EXCEPTION_FORBIDDEN)
    }

    const paciente = await this.obtenerPaciente(idPaciente)

    if (actor.rol.rol === RolEnum.NUTRICIONISTA) {
      const asignacion =
        await this.asignacionRepositorio.buscarAsignacionActivaPorMedicoPaciente(
          idUsuarioRol,
          idPaciente
        )

      if (!asignacion) {
        throw new PreconditionFailedException(Messages.PATIENT_NOT_ASSIGNED)
      }
    }

    const { persona, correoElectronico } = datos

    const op = async (transaction: EntityManager) => {
      const personaActual = await this.personaRepositorio.buscarPersonaId(
        paciente.usuario.idPersona,
        transaction
      )

      if (!personaActual) {
        throw new NotFoundException(Messages.INVALID_USER)
      }

      if (persona.telefono && persona.telefono !== personaActual.telefono) {
        const telefonoExistente =
          await this.personaRepositorio.buscarPersonaPorTelefono(
            persona.telefono,
            transaction
          )

        if (telefonoExistente && telefonoExistente.id !== personaActual.id) {
          throw new PreconditionFailedException(Messages.EXISTING_PHONE)
        }
      }

      if (
        persona.nroDocumento &&
        persona.nroDocumento !== personaActual.nroDocumento
      ) {
        const tipoDocumento =
          persona.tipoDocumento ??
          personaActual.tipoDocumento ??
          TipoDocumento.CI

        const personaExistente =
          await this.personaRepositorio.buscarPersonaPorDocumento(
            tipoDocumento,
            persona.nroDocumento
          )

        if (personaExistente && personaExistente.id !== personaActual.id) {
          throw new PreconditionFailedException(Messages.EXISTING_USER)
        }

        const usuarioExistente = await this.usuarioRepositorio.buscarUsuario(
          persona.nroDocumento
        )

        if (usuarioExistente && usuarioExistente.id !== paciente.usuario.id) {
          throw new PreconditionFailedException(Messages.EXISTING_USER)
        }
      }

      if (
        correoElectronico &&
        correoElectronico !== paciente.usuario.correoElectronico
      ) {
        const correoExistente =
          await this.usuarioRepositorio.buscarUsuarioPorCorreo(
            correoElectronico,
            transaction
          )

        if (correoExistente && correoExistente.id !== paciente.usuario.id) {
          throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
        }
      }

      await this.personaRepositorio.actualizar(
        personaActual.id,
        {
          nombres: persona.nombres ?? personaActual.nombres ?? undefined,
          primerApellido:
            persona.primerApellido ?? personaActual.primerApellido ?? undefined,
          segundoApellido:
            persona.segundoApellido ??
            personaActual.segundoApellido ??
            undefined,
          telefono: persona.telefono ?? personaActual.telefono ?? undefined,
          fechaNacimiento:
            persona.fechaNacimiento ??
            personaActual.fechaNacimiento ??
            undefined,
          genero: persona.genero ?? personaActual.genero ?? undefined,
          nroDocumento:
            persona.nroDocumento ?? personaActual.nroDocumento ?? undefined,
          tipoDocumento:
            persona.tipoDocumento ??
            personaActual.tipoDocumento ??
            TipoDocumento.CI,
        },
        usuarioAuditoria,
        transaction
      )

      if (
        persona.nroDocumento &&
        persona.nroDocumento !== personaActual.nroDocumento
      ) {
        await this.usuarioRepositorio.actualizarNombreUsuario(
          paciente.usuario.id,
          persona.nroDocumento,
          usuarioAuditoria,
          transaction
        )
      }

      if (
        correoElectronico &&
        correoElectronico !== paciente.usuario.correoElectronico
      ) {
        await this.usuarioRepositorio.actualizar(
          paciente.usuario.id,
          { correoElectronico },
          usuarioAuditoria,
          transaction
        )
      }

      return { id: paciente.usuario.id }
    }

    return await this.usuarioRepositorio.runTransaction(op)
  }

  async ReportePaciente({
    idPaciente,
  }: {
    usuarioAuditoria: string
    idPaciente: string
  }) {
    const paciente = await this.obtenerPaciente(idPaciente)
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

    const historiaClinica = await this.historiaClinicaService.buscarPorPaciente(
      paciente.id
    )

    if (!historiaClinica) {
      throw new NotFoundException(Messages.HISTORIA_CLINICA_NOT_FOUND)
    }
    const ultimaEvaluacion =
      await this.evaluacionesNutricionalesService.ultimaEvaluacion({
        idHistoriaClinica: historiaClinica.id,
      })

    const [evaluacionesNutricionales] =
      await this.evaluacionesNutricionalesService.listarEvaluacionesPorHistoriaClinica(
        {
          idHistoriaClinica: historiaClinica.id,
          paginacion: new QueryEvaluacionesDto(),
        }
      )

    if (evaluacionesNutricionales.length === 0) {
      throw new NotFoundException(
        'No se encontraron evaluaciones nutricionales para este paciente.'
      )
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
            text: [
              { text: 'IMC:', bold: true },
              {
                text: ultimaEvaluacion
                  ? String(ultimaEvaluacion.imc)
                  : 'Sin registrar',
              },
            ],
            alignment: 'right',
          },
        ],
      },
    ]

    // Datos de citas clínicas (10 registros ficticios)
    const citasClinicas = this.generarEvaluaciones(evaluacionesNutricionales)
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
  private generarEvaluaciones(
    evaluaciones: EvaluacionNutricionalResponde[]
  ): Content[] {
    const citas: Content[] = []

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
          ...evaluaciones.map((evaluacion) => {
            const peso = evaluacion.peso
            const altura = evaluacion.talla
            const imc = evaluacion.imc
            const observaciones = evaluacion.diagnosticoNutricional
            const fecha = dayjs(evaluacion.fechaCreacion).format(
              'DD/MM/YYYY HH:mm:ss'
            )
            return [
              { text: fecha },
              { text: peso ? String(peso) : 'Sin registrar' },
              { text: altura ? String(altura) : 'Sin registrar' },
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

  async actualizarDatosPersonalesPaciente({
    idPaciente,
    idNutricionista,
    usuarioAuditoria,
    datos,
  }: {
    idPaciente: string
    idNutricionista: string
    usuarioAuditoria: string
    datos: ActualizarDatosPersonalesPacienteDto
  }) {
    const { correoElectronico, telefono, genero } = datos

    if (
      correoElectronico === undefined &&
      telefono === undefined &&
      genero === undefined
    ) {
      throw new BadRequestException(Messages.UPDATE_DATA_REQUIRED)
    }

    const paciente = await this.obtenerPaciente(idPaciente)
    const nutricionista =
      await this.usuarioRolRepositorio.buscarPorId(idNutricionista)

    if (
      !nutricionista ||
      !(
        nutricionista.rol.rol === RolEnum.NUTRICIONISTA ||
        nutricionista.rol.rol === RolEnum.ADMINISTRADOR
      )
    ) {
      throw new ForbiddenException(Messages.EXCEPTION_FORBIDDEN)
    }

    if (nutricionista.rol.rol === RolEnum.NUTRICIONISTA) {
      const asignacion =
        await this.asignacionRepositorio.buscarAsignacionActivaPorMedicoPaciente(
          idNutricionista,
          idPaciente
        )

      if (!asignacion) {
        throw new PreconditionFailedException(Messages.PATIENT_NOT_ASSIGNED)
      }
    }

    const op = async (transaccion: EntityManager) => {
      const usuarioPaciente =
        await this.usuarioRepositorio.buscarDatosDeContactoDelUsuarioPorId(
          paciente.usuario.id,
          transaccion
        )

      if (!usuarioPaciente || !usuarioPaciente.persona) {
        throw new NotFoundException(Messages.INVALID_USER)
      }

      const persona = usuarioPaciente.persona

      if (
        correoElectronico !== undefined &&
        correoElectronico !== usuarioPaciente.correoElectronico
      ) {
        const existeCorreo =
          await this.usuarioRepositorio.buscarUsuarioPorCorreo(
            correoElectronico,
            transaccion
          )

        if (existeCorreo) {
          throw new PreconditionFailedException(Messages.EXISTING_EMAIL)
        }

        await this.usuarioRepositorio.actualizar(
          usuarioPaciente.id,
          { correoElectronico },
          usuarioAuditoria,
          transaccion
        )
      }

      const datosPersonaActualizar: {
        telefono?: string
        genero?: string
      } = {}

      if (telefono !== undefined && telefono !== persona.telefono) {
        const existeTelefono =
          await this.personaRepositorio.buscarPersonaPorTelefono(
            telefono,
            transaccion
          )

        if (existeTelefono) {
          throw new PreconditionFailedException(Messages.EXISTING_PHONE)
        }

        datosPersonaActualizar.telefono = telefono
      }

      if (genero !== undefined && genero !== persona.genero) {
        datosPersonaActualizar.genero = genero
      }

      if (Object.keys(datosPersonaActualizar).length > 0) {
        await this.personaRepositorio.actualizarDatosContacto(
          usuarioPaciente.idPersona,
          datosPersonaActualizar,
          usuarioAuditoria,
          transaccion
        )
      }

      return { id: paciente.usuario.id }
    }

    return await this.usuarioRepositorio.runTransaction(op)
  }
}
