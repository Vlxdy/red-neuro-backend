import { Genero, TipoDocumento, USUARIO_SISTEMA } from '@/common/constants'
import { TextService } from '@/common/lib/text.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import dayjs from 'dayjs'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { faker } from '@faker-js/faker'

interface PersonaI {
  nombres: string
  primerApellido: string
  segundoApellido: string
  tipoDocumento: TipoDocumento
  nroDocumento: string
  fechaNacimiento: string
  genero: Genero
}

interface UsuarioI {
  usuario: string
  correoElectronico: string
  persona: PersonaI
}

function numeroAleatorioEntre(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export class PacientesTest1741134363368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (String(process.env.NODE_ENV) === 'production') return

    const DEFAULT_PASS = '123'
    const pass = await TextService.encrypt(DEFAULT_PASS)

    const items: UsuarioI[] = []

    for (let i = 0; i < 100; i++) {
      const nroDocumento = numeroAleatorioEntre(1000000, 9999999).toString()
      const sexo = faker.person.sexType()
      const nombres = faker.person.firstName(sexo)
      items.push({
        usuario: nroDocumento,
        correoElectronico: faker.internet.email(),
        persona: {
          nombres,
          primerApellido: faker.person.lastName(),
          segundoApellido: faker.person.lastName(),
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: nroDocumento,
          fechaNacimiento: faker.date
            .between({ from: '1950-01-01', to: '2005-01-01' })
            .toISOString()
            .split('T')[0],
          genero: sexo === 'female' ? Genero.FEMENINO : Genero.MASCULINO,
        },
      })
    }

    for (const item of items) {
      const persona = new Persona({
        fechaNacimiento: dayjs(
          item.persona.fechaNacimiento,
          'YYYY-MM-DD'
        ).toDate(),
        genero: item.persona.genero,
        nombres: item.persona.nombres,
        nroDocumento: item.persona.nroDocumento,
        primerApellido: item.persona.primerApellido,
        segundoApellido: item.persona.segundoApellido,
        tipoDocumento: item.persona.tipoDocumento,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
      const personaResult = await queryRunner.manager.save(persona)
      const usuario = new Usuario({
        ciudadaniaDigital: false,
        contrasena: pass,
        intentos: 0,
        usuario: item.usuario,
        correoElectronico: item.correoElectronico,
        idPersona: personaResult.id,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
      await queryRunner.manager.save(usuario)

      const usuarioRol = new UsuarioRol({
        idRol: '3',
        idUsuario: usuario.id,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })

      await queryRunner.manager.save(usuarioRol)
    }
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
