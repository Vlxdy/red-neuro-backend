import { Usuario } from '../../src/core/usuario/entity/usuario.entity'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { TextService } from '../../src/common/lib/text.service'
import {
  Genero,
  TipoDocumento,
  USUARIO_SISTEMA,
} from '../../src/common/constants'
import dayjs from 'dayjs'
import { Persona } from '../../src/core/usuario/entity/persona.entity'

export class usuario1611171041790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_PASS = '123'
    const pass = await TextService.encrypt(DEFAULT_PASS)
    const items = [
      {
        //id: 1,
        usuario: 'ADMINISTRADOR',
        correoElectonico: 'agepic-9270815@yopmail.com',
        persona: {
          nombres: 'YASMIN',
          primerApellido: 'RODRIGUEZ',
          segundoApellido: 'ROMERO',
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: '9270815',
          fechaNacimiento: '2001-12-16',
          genero: Genero.FEMENINO,
        },
      },
      {
        //id: 2,
        usuario: 'ADMINISTRADOR-TECNICO',
        correoElectonico: 'agepic-1765251@yopmail.com',
        persona: {
          nombres: 'ALBANO',
          primerApellido: 'ROJAS',
          segundoApellido: 'AGUADA',
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: '1765251',
          fechaNacimiento: '1967-05-28',
          genero: Genero.MASCULINO,
        },
      },
      {
        //id: 3,
        usuario: 'TECNICO',
        correoElectonico: 'agepic-6114767@yopmail.com',
        persona: {
          nombres: 'JESUS',
          primerApellido: 'ROJAS',
          segundoApellido: 'ZABALA',
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: '6114767',
          fechaNacimiento: '2009-02-28',
          genero: Genero.MASCULINO,
        },
      },
    ]

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
        correoElectronico: item.correoElectonico,
        idPersona: personaResult.id,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
      await queryRunner.manager.save(usuario)
    }
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
