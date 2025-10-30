import { CasbinRule } from '@/core/authorization/entity/casbin.entity'
import { RolEnum } from '@/core/authorization/rol.enum'
import { MigrationInterface, QueryRunner } from 'typeorm'

export class insertCasbinRules1617712857472 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
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
        [RolEnum.NUTRICIONISTA]: 'read|update',
        [RolEnum.PACIENTE]: 'read|update',
      },

      '/admin/home': {
        [RolEnum.ADMINISTRADOR]: 'read',
        [RolEnum.NUTRICIONISTA]: 'read',
        [RolEnum.PACIENTE]: 'read',
      },
      // '/admin/roles': {
      //   [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      // },
      // '/admin/nutricionistas': {
      //   [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      // },
      '/admin/nutricionistas': {
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      },
      '/admin/pacientes': {
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
        [RolEnum.NUTRICIONISTA]: 'read|create|update|delete',
      },
      '/admin/citas-nutricionista': {
        [RolEnum.NUTRICIONISTA]: 'read|create|update|delete',
        [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
      },

      '/admin/mi-seguimiento': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/plan-nutricional': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/lista-compras': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/mi-actividad': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/recomendaciones': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/comunicacion': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
      '/admin/notificaciones': {
        [RolEnum.PACIENTE]: 'read|create|update|delete',
      },
    }

    const backendRoutes: CasbinValue = {
      '/api/autorizacion/politicas': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
      },
      '/api/autorizacion/modulos': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST|DELETE|PATCH',
        [RolEnum.NUTRICIONISTA]: 'GET',
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
        [RolEnum.NUTRICIONISTA]: 'GET',
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
        [RolEnum.NUTRICIONISTA]: 'GET',
      },

      '/api/usuarios/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH|GET' },

      '/api/usuarios/cuenta/ciudadania': { [RolEnum.ADMINISTRADOR]: 'POST' },

      '/api/usuarios/:id/activacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/usuarios/:id/inactivacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },
      '/api/usuarios/:id/restauracion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/usuarios/:id/reenviar': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.NUTRICIONISTA]: 'GET|POST',
      },
      '/api/parametros/:id': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:id/activacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:id/inactivacion': { [RolEnum.ADMINISTRADOR]: 'PATCH' },

      '/api/parametros/:grupo/listado': { [RolEnum.TODOS]: 'GET' },

      '/api/autorizacion/permisos': { [RolEnum.TODOS]: 'GET' },

      '/api/usuarios/cuenta/perfil': { [RolEnum.TODOS]: 'GET|PATCH' },

      '/api/usuarios/cuenta/foto': { [RolEnum.TODOS]: 'PATCH' },

      '/api/usuarios/cuenta/contrasena': { [RolEnum.TODOS]: 'PATCH' },

      // consultas
      '/api/consultas': { [RolEnum.ADMINISTRADOR]: 'GET|POST' },
      // seguimiento
      '/api/seguimiento': { [RolEnum.ADMINISTRADOR]: 'GET|POST' },

      // citas
      '/api/citas': {
        [RolEnum.NUTRICIONISTA]: 'GET|POST',
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.PACIENTE]: 'GET|POST',
      },
      '/api/citas/:id': {
        [RolEnum.NUTRICIONISTA]: 'PATCH|DELETE',
        [RolEnum.ADMINISTRADOR]: 'PATCH|DELETE',
        [RolEnum.PACIENTE]: 'PATCH',
      },
      '/api/citas/:id/enviar': { [RolEnum.PACIENTE]: 'POST' },
      '/api/citas/:id/cancelar': {
        [RolEnum.PACIENTE]: 'POST',
        [RolEnum.NUTRICIONISTA]: 'POST',
        [RolEnum.ADMINISTRADOR]: 'POST',
      },
      '/api/citas/:id/reabrir': { [RolEnum.PACIENTE]: 'POST' },
      '/api/citas/:id/aprobar': {
        [RolEnum.NUTRICIONISTA]: 'POST',
        [RolEnum.ADMINISTRADOR]: 'POST',
      },
      '/api/citas/:id/rechazar': {
        [RolEnum.NUTRICIONISTA]: 'POST',
        [RolEnum.ADMINISTRADOR]: 'POST',
      },
      '/api/citas/:id/reprogramar': {
        [RolEnum.NUTRICIONISTA]: 'POST',
        [RolEnum.ADMINISTRADOR]: 'POST',
      },
      '/api/citas/:id/historial': {
        [RolEnum.PACIENTE]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.ADMINISTRADOR]: 'GET',
      },
      '/api/citas/cron-activar': { [RolEnum.ADMINISTRADOR]: 'GET' },
      // verificados
      // --------------------------
      // Asignaciones (Pacientes asignados a medicos)
      '/api/asignacion': {
        [RolEnum.ADMINISTRADOR]: 'POST',
        [RolEnum.NUTRICIONISTA]: 'POST',
      },
      '/api/asignacion/eliminar': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.NUTRICIONISTA]: 'PATCH',
      },
      // Medicos
      '/api/medicos/:id/pacientes-por-asignar': {
        [RolEnum.ADMINISTRADOR]: 'GET',
      },
      '/api/medicos/:id/pacientes': { [RolEnum.ADMINISTRADOR]: 'GET' },
      // Notificaciones
      '/api/notificaciones': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.NUTRICIONISTA]: 'GET|PATCH',
        [RolEnum.PACIENTE]: 'GET|PATCH',
      },
      '/api/notificacion': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.NUTRICIONISTA]: 'GET|PATCH',
        [RolEnum.PACIENTE]: 'GET|PATCH',
      },
      '/api/planes-nutricionales/generar': {
        [RolEnum.ADMINISTRADOR]: 'POST',
        [RolEnum.NUTRICIONISTA]: 'POST',
      },
      '/api/planes-nutricionales': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.NUTRICIONISTA]: 'GET|POST',
      },
      '/api/planes-nutricionales/multiple': {
        [RolEnum.ADMINISTRADOR]: 'POST',
        [RolEnum.NUTRICIONISTA]: 'POST',
      },
      '/api/planes-nutricionales/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.NUTRICIONISTA]: 'GET|PATCH',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/planes-nutricionales/:id/inactivar': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.NUTRICIONISTA]: 'PATCH',
      },
      '/api/planes-nutricionales/paciente/:idUsuarioRol/fecha/:fecha': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/planes-nutricionales/paciente/:idUsuarioRol': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/planes-nutricionales/paciente/:idUsuarioRol/carrito-compras': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/evaluacion-nutricional': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/evaluacion-nutricional/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
        [RolEnum.NUTRICIONISTA]: 'GET|PATCH',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/historia-clinica/:id/evaluacion-nutricional': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.NUTRICIONISTA]: 'GET|POST',
        [RolEnum.PACIENTE]: 'GET',
      },
      // Pacientes
      '/api/pacientes/asignados': { [RolEnum.NUTRICIONISTA]: 'GET' },
      '/api/pacientes': {
        [RolEnum.ADMINISTRADOR]: 'GET|POST',
        [RolEnum.NUTRICIONISTA]: 'GET|POST',
      },
      '/api/pacientes/:id': {
        [RolEnum.ADMINISTRADOR]: 'GET|PUT',
        [RolEnum.NUTRICIONISTA]: 'GET|PUT',
      },
      '/api/pacientes/:id/historia-clinica': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
      },
      '/api/pacientes/:id/reporte': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'GET',
      },
      '/api/pacientes/:id/citas': {
        [RolEnum.ADMINISTRADOR]: 'GET',
        [RolEnum.NUTRICIONISTA]: 'GET',
        [RolEnum.PACIENTE]: 'POST',
      },
      '/api/pacientes/:id/datos-personales': {
        [RolEnum.ADMINISTRADOR]: 'PATCH',
        [RolEnum.NUTRICIONISTA]: 'PATCH',
      },
      // usuarios registrados
      '/api/usuarios-registrados/:rol': { [RolEnum.ADMINISTRADOR]: 'GET' },
      '/api/profesionales/:id/citas/confirmada': {
        [RolEnum.NUTRICIONISTA]: 'POST',
        [RolEnum.ADMINISTRADOR]: 'POST',
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
