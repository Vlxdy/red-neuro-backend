import { CasbinRule } from '../../src/core/authorization/entity/casbin.entity'
import { RolEnum } from '../../src/core/authorization/rol.enum'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class insertCasbinRules1617712857472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const frontendRoutes: CasbinValue = {
      '/admin/usuarios': {
        [RolEnum.ADMINISTRADOR]: 'read|update|create|delete',
        [RolEnum.TECNICO]: 'read',
      },
      '/admin/parametros': {
        [RolEnum.ADMINISTRADOR]: 'read|update|create',
        [RolEnum.TECNICO]: 'read',
      },

      '/admin/modulos': {
        [RolEnum.ADMINISTRADOR]: 'read|update|create',
      },

      '/admin/politicas': {
        [RolEnum.ADMINISTRADOR]: 'create|read|update|delete',
      },

      '/admin/perfil': {
        [RolEnum.ADMINISTRADOR]: 'read|update',
        [RolEnum.TECNICO]: 'read|update',
        [RolEnum.USUARIO]: 'read|update',
      },

      '/admin/home': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [RolEnum.TECNICO]: 'read',
        [RolEnum.USUARIO]: 'read',
      },
      '/admin/roles': {
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      },
    }

    const backendRoutes: CasbinValue = {
      '/api/autorizacion/politicas': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },
      '/api/autorizacion/modulos': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
        [RolEnum.TECNICO]: 'GET',
      },

      '/api/autorizacion/modulos/:id': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/autorizacion/modulos/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },

      '/api/autorizacion/modulos/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },

      '/api/autorizacion/roles': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.TECNICO]: 'GET',
      },

      '/api/autorizacion/roles/todos': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
      },
      '/api/autorizacion/roles/:id': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/autorizacion/roles/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/autorizacion/roles/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/usuarios': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.TECNICO]: 'GET',
      },

      '/api/usuarios/:id': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/usuarios/cuenta/ciudadania': {
        [RolEnum.ADMINISTRADOR]: 'POST',
      },

      '/api/usuarios/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/usuarios/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      '/api/usuarios/:id/restauracion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/usuarios/:id/reenviar': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/parametros': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.TECNICO]: 'GET|POST',
      },
      '/api/parametros/:id': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/parametros/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/parametros/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/parametros/:grupo/listado': {
        [RolEnum.TODOS]: 'GET',
      },

      '/api/autorizacion/permisos': {
        [RolEnum.TODOS]: 'GET',
      },

      '/api/usuarios/cuenta/perfil': {
        [RolEnum.TODOS]: 'GET',
      },

      '/api/usuarios/cuenta/contrasena': {
        [RolEnum.TODOS]: 'PATCH',
      },
    }

    const registrarCasbin = async (
      valoresCasbin: CasbinValue,
      tipo: string
    ) => {
      for (const routePath of Object.keys(valoresCasbin)) {
        const rolNameList = Object.keys(valoresCasbin[routePath])
        for (const rolName of rolNameList) {
          const action = valoresCasbin[routePath][rolName]
          const datosRegistro = new CasbinRule({
            ptype: 'p',
            v0: rolName,
            v1: routePath,
            v2: action,
            v3: tipo,
          })
          await queryRunner.manager.save(datosRegistro)
        }
      }
    }

    await registrarCasbin(frontendRoutes, 'frontend')
    await registrarCasbin(backendRoutes, 'backend')
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}

export type RouteItem = {
  [key: string]: string
}

export type CasbinValue = {
  [key: string]: RouteItem
}
