import { Usuario } from '@/core/usuario/entity/usuario.entity'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { TextService } from '@/common/lib/text.service'
import { Genero, TipoDocumento, USUARIO_SISTEMA } from '@/common/constants'
import dayjs from 'dayjs'
import { Persona } from '@/core/usuario/entity/persona.entity'

export class usuario1611171041790 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const DEFAULT_PASS = '1234'
    const pass = await TextService.encrypt(DEFAULT_PASS)
    const items = [
      {
        //id: 1,
        usuario: 'ADMINISTRADOR',
        correoElectonico: 'vcopafabian@gmail.com',
        persona: {
          nombres: 'VLADIMIR',
          primerApellido: 'COPA',
          segundoApellido: 'FABIAN',
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: '6990223',
          fechaNacimiento: '1992-03-29',
          genero: Genero.MASCULINO,
          telefono: '65541588',
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
        telefono: item.persona.telefono,
        usuarioCreacion: USUARIO_SISTEMA,
      })
      const personaResult = await queryRunner.manager.save(persona)
      const usuario = new Usuario({
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
