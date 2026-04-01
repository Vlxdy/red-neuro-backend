import { CasbinRule } from '@/core/authorization/entity/casbin.entity'
import { RolEnum } from '@/core/authorization/rol.enum'
import { QueryRunner } from 'typeorm'

type RouteItem = { [key: string]: string }

type CasbinValue = { [key: string]: RouteItem }

const frontendRoutes: CasbinValue = {
  '/admin/usuarios': {
    [RolEnum.ADMINISTRADOR]: 'read|update|create|delete',
  },
  '/admin/perfil': {
    [RolEnum.ADMINISTRADOR]: 'read|update',
    [RolEnum.JEFE]: 'read|update',
    [RolEnum.COORDINADOR]: 'read|update',
    [RolEnum.PERSONAL]: 'read|update',
    [RolEnum.PROFESIONAL_INVITADO]: 'read|update',
  },
  '/admin/home': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
    [RolEnum.PERSONAL]: 'read',
    [RolEnum.PROFESIONAL_INVITADO]: 'read',
  },
  '/admin/notificaciones': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
    [RolEnum.PERSONAL]: 'read',
    [RolEnum.PROFESIONAL_INVITADO]: 'read',
  },
  '/admin/citas': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
    [RolEnum.PERSONAL]: 'read',
    [RolEnum.PROFESIONAL_INVITADO]: 'read',
  },
  '/admin/pacientes': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
    [RolEnum.PERSONAL]: 'read',
    [RolEnum.PROFESIONAL_INVITADO]: 'read',
  },
  '/admin/personal_medico': {
    [RolEnum.ADMINISTRADOR]: 'read',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
  },
  '/admin/servicios': {
    [RolEnum.ADMINISTRADOR]: 'read|create|update|delete',
    [RolEnum.JEFE]: 'read',
    [RolEnum.COORDINADOR]: 'read',
  },
  '/admin/lugares': {
    [RolEnum.ADMINISTRADOR]: 'read|create|update',
    [RolEnum.JEFE]: 'read|create|update',
    [RolEnum.COORDINADOR]: 'read',
  },
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
    [RolEnum.ADMINISTRADOR]: 'PATCH',
  },
  '/api/autorizacion/modulos/:id/inactivacion': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
  },
  '/api/autorizacion/roles': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
  },
  '/api/autorizacion/roles/todos': { [RolEnum.ADMINISTRADOR]: 'GET' },
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
  '/api/citas': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET|POST',
    [RolEnum.PERSONAL]: 'GET|POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET|POST',
  },
  '/api/citas/mis-citas': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/home/bandeja': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/home/pendientes-aprobacion': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/home/rechazadas-solicitadas': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/home/borradores': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/home/programadas-asignadas': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|DELETE',
    [RolEnum.JEFE]: 'GET|DELETE',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/paginado': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/cantidad-por-dia': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/citas/:id/reprogramar': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
    [RolEnum.COORDINADOR]: 'PATCH',
    [RolEnum.PERSONAL]: 'PATCH',
    [RolEnum.PROFESIONAL_INVITADO]: 'PATCH',
  },
  '/api/citas/:id/cancelar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/editar-borrador': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
    [RolEnum.COORDINADOR]: 'PATCH',
    [RolEnum.PERSONAL]: 'PATCH',
    [RolEnum.PROFESIONAL_INVITADO]: 'PATCH',
  },
  '/api/citas/:id/editar-programada': {
    [RolEnum.JEFE]: 'PATCH',
    [RolEnum.COORDINADOR]: 'PATCH',
  },
  '/api/citas/:id/enviar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/confirmar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/rechazar': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/dar-alta': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/programar-control': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/:id/no-asistio': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/citas/ejecutar-auto-no-asistio': {
    [RolEnum.ADMINISTRADOR]: 'POST',
  },
  '/api/consultorios': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/consultorios/:id': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/consultorios/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/servicios': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/servicios/categorias/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/servicios/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
    [RolEnum.JEFE]: 'GET|PATCH',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/servicios/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/categorias': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/categorias/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
    [RolEnum.JEFE]: 'GET|PATCH',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/categorias/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/pacientes': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET|POST',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/pacientes/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH',
    [RolEnum.JEFE]: 'GET|PATCH',
    [RolEnum.COORDINADOR]: 'GET|PATCH',
    [RolEnum.PERSONAL]: 'GET|PATCH',
  },
  '/api/pacientes/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/personal-salud': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
  },
  '/api/personal-salud/:id': {
    [RolEnum.ADMINISTRADOR]: 'GET|PATCH|DELETE',
    [RolEnum.JEFE]: 'GET|PATCH',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
  },
  '/api/personal-salud/:id/activacion': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/personal-salud/:id/inactivacion': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/personal-salud/:id/restauracion-contrasena': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/citas/:id/historial': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/notificaciones': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/notificaciones/:id/visto': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
    [RolEnum.COORDINADOR]: 'PATCH',
    [RolEnum.PERSONAL]: 'PATCH',
    [RolEnum.PROFESIONAL_INVITADO]: 'PATCH',
  },
  '/api/notificaciones/marcar-todas-vistas': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
    [RolEnum.COORDINADOR]: 'PATCH',
    [RolEnum.PERSONAL]: 'PATCH',
    [RolEnum.PROFESIONAL_INVITADO]: 'PATCH',
  },
  '/api/notificaciones/resumen-diario': {
    [RolEnum.ADMINISTRADOR]: 'GET',
    [RolEnum.JEFE]: 'GET',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/notificaciones/ejecutar-resumen-diario': {
    [RolEnum.ADMINISTRADOR]: 'POST',
  },
  '/api/notificaciones/validar-config-push': {
    [RolEnum.ADMINISTRADOR]: 'GET',
  },
  '/api/dispositivos-push': {
    [RolEnum.ADMINISTRADOR]: 'POST',
    [RolEnum.JEFE]: 'POST',
    [RolEnum.COORDINADOR]: 'POST',
    [RolEnum.PERSONAL]: 'POST',
    [RolEnum.PROFESIONAL_INVITADO]: 'POST',
  },
  '/api/dispositivos-push/:token': {
    [RolEnum.ADMINISTRADOR]: 'DELETE',
    [RolEnum.JEFE]: 'DELETE',
    [RolEnum.COORDINADOR]: 'DELETE',
    [RolEnum.PERSONAL]: 'DELETE',
    [RolEnum.PROFESIONAL_INVITADO]: 'DELETE',
  },
  '/api/lugares': {
    [RolEnum.ADMINISTRADOR]: 'GET|POST',
    [RolEnum.JEFE]: 'GET|POST',
    [RolEnum.COORDINADOR]: 'GET',
    [RolEnum.PERSONAL]: 'GET',
    [RolEnum.PROFESIONAL_INVITADO]: 'GET',
  },
  '/api/lugares/:id': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
  },
  '/api/lugares/:id/cambiar-estado': {
    [RolEnum.ADMINISTRADOR]: 'PATCH',
    [RolEnum.JEFE]: 'PATCH',
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
