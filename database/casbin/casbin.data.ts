import { CasbinRule } from '@/core/authorization/entity/casbin.entity'
import { RolEnum } from '@/core/authorization/rol.enum'
import { QueryRunner } from 'typeorm'

const ROL_PERSONAL_SALUD_ADMIN = 'PERSONAL_SALUD_ADMIN'
type RouteItem = { [key: string]: string }

type CasbinValue = { [key: string]: RouteItem }

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
  '/admin/notificaciones': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.PERSONAL_SALUD]: 'read',
  },
  '/admin/categorias': {
    [RolEnum.ADMINISTRADOR]: 'read|create|update',
    [RolEnum.PERSONAL_SALUD]: 'read',
  },
  '/admin/estudios': {
    [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
    [RolEnum.PERSONAL_SALUD]: 'read',
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
  '/admin/lugares': {
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
    [RolEnum.PERSONAL_SALUD]: 'GET',
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
    [RolEnum.ADMINISTRADOR]: 'GET|DELETE',
    [RolEnum.PERSONAL_SALUD]: 'GET|DELETE',
  },
  '/api/citas/paginado': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/citas/cantidad-por-dia': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/citas/:id/reprogramar': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  '/api/citas/:id/cancelar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/:id/editar-borrador': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  '/api/citas/:id/enviar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/:id/confirmar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/:id/rechazar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/:id/completar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/:id/no-asistio': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/citas/ejecutar-auto-no-asistio': {
    [RolEnum.ADMINISTRADOR]: 'POST',
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
  '/api/servicios': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/servicios/categorias/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/servicios/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/servicios/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
  },
  // CATEGORÍAS DE SERVICIOS
  '/api/categorias': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/categorias/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/categorias/:id/cambiar-estado': {
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
  '/api/personal-salud': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.PERSONAL_SALUD]: 'GET|POST',
  },
  '/api/personal-salud/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH|DELETE',
    [RolEnum.PERSONAL_SALUD]: 'GET|PATCH|DELETE',
  },
  '/api/personal-salud/:id/activacion': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  '/api/personal-salud/:id/inactivacion': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  // HISTORIAL DE CITAS
  '/api/citas/:id/historial': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/notificaciones': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/notificaciones/:id/visto': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  '/api/notificaciones/marcar-todas-vistas': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.PERSONAL_SALUD]: 'PATCH',
  },
  '/api/notificaciones/resumen-diario': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/notificaciones/ejecutar-resumen-diario': {
    [RolEnum.ADMINISTRADOR]: 'POST',
  },
  '/api/notificaciones/validar-config-push': {
    [RolEnum.ADMINISTRADOR]: 'GET',
  },
  '/api/dispositivos-push': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.PERSONAL_SALUD]: 'POST',
  },
  '/api/dispositivos-push/:token': {
    [RolEnum.ADMINISTRADOR]: 'DELETE',
    [RolEnum.PERSONAL_SALUD]: 'DELETE',
  },
  // LUGARES
  '/api/lugares': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [ROL_PERSONAL_SALUD_ADMIN]: 'GET|POST',
    [RolEnum.PERSONAL_SALUD]: 'GET',
  },
  '/api/lugares/:id': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [ROL_PERSONAL_SALUD_ADMIN]: 'PATCH',
  },
  '/api/lugares/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [ROL_PERSONAL_SALUD_ADMIN]: 'PATCH',
  },
}

export const runCasbinSeed = async (
  queryRunner: QueryRunner
): Promise<void> => {
  await queryRunner.manager.clear(CasbinRule)

  await registrarCasbin(frontendRoutes, 'frontend', queryRunner)
  await registrarCasbin(backendRoutes, 'backend', queryRunner)
}

const registrarCasbin = async (
  valoresCasbin: CasbinValue,
  tipo: string,
  queryRunner: QueryRunner
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
