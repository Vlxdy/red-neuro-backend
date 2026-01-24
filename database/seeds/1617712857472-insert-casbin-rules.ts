import { CasbinRule } from '@/core/authorization/entity/casbin.entity'
import { RolEnum } from '@/core/authorization/rol.enum'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class insertCasbinRules1617712857472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const ROL_PERSONAL_SALUD_ADMIN = 'PERSONAL_SALUD_ADMIN'

    const frontendRoutes: CasbinValue = {
      '/admin/usuarios': {
        [RolEnum.ADMINISTRADOR]: 'read|update|create|delete',
      },
      // '/admin/parametros': {
      //   [RolEnum.ADMINISTRADOR]: 'read|update|create',
      //   [RolEnum.NUTRICIONISTA]: 'read',
      // },

      // '/admin/modulos': {
      //   [RolEnum.ADMINISTRADOR]: 'read|update|create',
      // },

      // '/admin/politicas': {
      //   [RolEnum.ADMINISTRADOR]: 'create|read|update|delete',
      // },

      '/admin/perfil': {
        [RolEnum.ADMINISTRADOR]: 'read|update',
        [RolEnum.PERSONAL_SALUD]: 'read|update',
      },

      '/admin/home': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [RolEnum.PERSONAL_SALUD]: 'read',
      },
      '/admin/especialidades': {
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      },
      '/admin/estudios': {
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      },
      '/admin/citas': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [RolEnum.PERSONAL_SALUD]: 'read',
      },
      '/admin/pacientes': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [RolEnum.PERSONAL_SALUD]: 'read',
      },
      '/admin/personal_medico': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [ROL_PERSONAL_SALUD_ADMIN]: 'read',
      },
      // '/admin/roles': {
      //   [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      // },
      // '/admin/nutricionistas': {
      //   [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      // },
    }

    const backendRoutes: CasbinValue = {
      '/api/autorizacion/politicas': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },
      '/api/autorizacion/modulos': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },

      '/api/autorizacion/modulos/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/autorizacion/modulos/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },

      '/api/autorizacion/modulos/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },

      '/api/autorizacion/roles': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
      },

      '/api/autorizacion/roles/todos': { [RolEnum.ADMINISTRADOR]: 'GET|POST' },
      '/api/autorizacion/roles/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/autorizacion/roles/:id/activacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/autorizacion/roles/:id/inactivacion': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },

      '/api/usuarios': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
      },

      '/api/usuarios/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH|GET' },

      '/api/usuarios/cuenta/ciudadania': { [RolEnum.ADMINISTRADOR]: 'POST' },

      '/api/usuarios/:id/activacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/usuarios/:id/inactivacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },
      '/api/usuarios/:id/restauracion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/usuarios/:id/reenviar': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
      },
      '/api/parametros/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:id/activacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:id/inactivacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:grupo/listado': { [RolEnum.TODOS]: 'GET' },

      '/api/autorizacion/permisos': { [RolEnum.TODOS]: 'GET' },

      '/api/usuarios/cuenta/perfil': { [RolEnum.TODOS]: 'GET|PATCH' },

      '/api/usuarios/cuenta/foto': { [RolEnum.TODOS]: 'PATCH' },

      '/api/usuarios/cuenta/contrasena': { [RolEnum.TODOS]: 'PATCH' },

      // Gestión de citas médicas
      '/api/citas': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PERSONAL_SALUD]: 'GET|POST',
      },
      '/api/citas/mis-citas': {
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/citas/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.PERSONAL_SALUD]: 'GET|PATCH',
      },
      '/api/citas/paginado': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/citas/:id/estado': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.PERSONAL_SALUD]: 'PATCH',
      },
      '/api/citas/:id/reprogramar': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.PERSONAL_SALUD]: 'PATCH',
      },
      '/api/citas/:id/cancelar': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.PERSONAL_SALUD]: 'PATCH',
      },
      // CONSULTORIOS MÉDICOS
      '/api/consultorios': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/consultorios/:id': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      '/api/consultorios/:id/cambiar-estado': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      // ESTUDIOS MÉDICOS
      '/api/estudios': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/estudios/especialidades/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/estudios/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/estudios/:id/especialidades': {
        [RolEnum.ADMINISTRADOR]: 'POST',
      },
      '/api/estudios/:id/cambiar-estado': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      // ESPECIALIDADES MÉDICAS
      '/api/especialidades': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/especialidades/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      '/api/especialidades/:id/cambiar-estado': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      // PACIENTES
      '/api/pacientes': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PERSONAL_SALUD]: 'GET|POST',
      },
      '/api/pacientes/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.PERSONAL_SALUD]: 'GET|PATCH',
      },
      '/api/pacientes/:id/cambiar-estado': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
      },
      // PERSONAL MÉDICO
      '/api/personal-medico': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.PERSONAL_SALUD]: 'GET',
      },
      // HISTORIAL DE CITAS
      '/api/citas/:id/historial': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.PERSONAL_SALUD]: 'GET',
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

export type RouteItem = { [key: string]: string }

export type CasbinValue = { [key: string]: RouteItem }
