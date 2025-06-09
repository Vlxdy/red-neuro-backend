import { USUARIO_SISTEMA } from '@/common/constants'
import { TextService } from '@/common/lib/text.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import dayjs from 'dayjs'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { personasFake } from 'database/fakes-data/usuarios.fake'

export class PacientesTest1741134363368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (String(process.env.NODE_ENV) === 'production') return

    const DEFAULT_PASS = '123'
    const pass = await TextService.encrypt(DEFAULT_PASS)

    for (const item of personasFake) {
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
