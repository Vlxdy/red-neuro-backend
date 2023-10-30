import { MigrationInterface, QueryRunner } from 'typeorm'
import { Parametro } from '../../src/application/parametro/entity'
import { USUARIO_SISTEMA } from '../../src/common/constants'

export class insertsParametros1617820337609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TIPO DOCUMENTO
    const items = [
      {
        codigo: 'TD-CI',
        nombre: 'Cédula de identidad',
        grupo: 'TD',
        descripcion: 'Cédula de Identidad',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TD-CIE',
        nombre: 'Cédula de identidad de extranjero',
        grupo: 'TD',
        descripcion: 'Cédula de identidad de extranjero',
        _transaccion: 'SEEDS',
      },
      // APPS
      {
        codigo: 'TAPP-B',
        nombre: 'Backend',
        grupo: 'TAPP',
        descripcion: 'Backend',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TAPP-F',
        nombre: 'Frontend',
        grupo: 'TAPP',
        descripcion: 'Frontend',
        _transaccion: 'SEEDS',
      },
      // ACCIONES
      // FRONTEND
      {
        codigo: 'TACCF-R',
        nombre: 'read',
        grupo: 'TACCF',
        descripcion: 'READ',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCF-U',
        nombre: 'update',
        grupo: 'TACCF',
        descripcion: 'UPDATE',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCF-C',
        nombre: 'create',
        grupo: 'TACCF',
        descripcion: 'CREATE',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCF-D',
        nombre: 'delete',
        grupo: 'TACCF',
        descripcion: 'DELETE',
        _transaccion: 'SEEDS',
      },
      // BACKEND
      {
        codigo: 'TACCB-G',
        nombre: 'GET',
        grupo: 'TACCB',
        descripcion: 'GET',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCB-U',
        nombre: 'UPDATE',
        grupo: 'TACCB',
        descripcion: 'UPDATE',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCF-P',
        nombre: 'PATCH',
        grupo: 'TACC',
        descripcion: 'PATCH',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCB-C',
        nombre: 'POST',
        grupo: 'TACCB',
        descripcion: 'POST',
        _transaccion: 'SEEDS',
      },
      {
        codigo: 'TACCB-D',
        nombre: 'DELETE',
        grupo: 'TACCB',
        descripcion: 'DELETE',
        _transaccion: 'SEEDS',
      },
    ]
    const parametros = items.map((item) => {
      return new Parametro({
        codigo: item.codigo,
        nombre: item.nombre,
        grupo: item.grupo,
        descripcion: item.descripcion,
        estado: 'ACTIVO',
        transaccion: 'SEEDS',
        usuarioCreacion: USUARIO_SISTEMA,
      })
    })
    await queryRunner.manager.save(parametros)
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
