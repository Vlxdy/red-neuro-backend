import { Modulo, Propiedades } from '@/core/authorization/entity/modulo.entity'
import { MigrationInterface, QueryRunner } from 'typeorm'
import { USUARIO_SISTEMA } from '@/common/constants'

export class modulo1611497480901 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const items = [
      // MENU SECCION PRINCIPAL
      {
        nombre: 'Principal',
        url: '/principal',
        label: 'Principal',
        propiedades: {
          descripcion: 'Sección principal',
          orden: 1,
        },
        subMenus: [
          {
            nombre: 'inicio',
            url: '/admin/home',
            label: 'Inicio',
            propiedades: {
              icono: 'home',
              descripcion:
                'Vista de bienvenida con características del sistema',
              orden: 1,
            },
          },
          {
            nombre: 'perfil',
            url: '/admin/perfil',
            label: 'Perfil',
            propiedades: {
              icono: 'person',
              descripcion:
                'Información del perfil de usuario que inicio sesión',
              orden: 2,
            },
          },
        ],
      },
      {
        nombre: 'Mi salud',
        url: '/mi-salud',
        label: 'Mi salud',
        propiedades: {
          descripcion: 'Sección de salud',
          orden: 1,
        },
        subMenus: [
          {
            nombre: 'Plan nutricional',
            url: '/admin/plan-nutricional',
            label: 'Plan nutricional',
            propiedades: {
              icono: 'restaurant_menu',
              descripcion: 'Plan nutricional del paciente',
              orden: 1,
            },
          },
          {
            nombre: 'Lista de compras',
            url: '/admin/lista-compras',
            label: 'Lista de compras',
            propiedades: {
              icono: 'shopping_bag',
              descripcion: 'Lista de compras',
              orden: 2,
            },
          },
          {
            nombre: 'Mis actividades',
            url: '/admin/mi-actividad',
            label: 'Mis actividades',
            propiedades: {
              icono: 'directions_run',
              descripcion: 'Actividades de salud',
              orden: 3,
            },
          },

          // {
          //   nombre: 'recomendaciones',
          //   url: '/admin/recomendaciones',
          //   label: 'Recomendaciones',
          //   propiedades: {
          //     icono: 'tips_and_updates',
          //     descripcion: 'Recomendaciones para mis pacientes',
          //     orden: 5,
          //   },
          // },
        ],
      },
      {
        nombre: 'Seguimiento-Paciente',
        url: '/seguimiento-paciente',
        label: 'Seguimiento',
        propiedades: {
          descripcion: 'Sección de seguimiento',
          orden: 2,
        },
        subMenus: [
          {
            nombre: 'mi-seguimiento',
            url: '/admin/mi-seguimiento',
            label: 'Mi seguimiento',
            propiedades: {
              icono: 'monitor_heart',
              descripcion: 'Seguimiento de mis pacientes',
              orden: 1,
            },
          },
          {
            nombre: 'comunicacion y consultas',
            url: '/admin/comunicacion',
            label: 'Comunicación y consultas',
            propiedades: {
              icono: 'chat',
              descripcion: 'Comunicación con el nutricionista',
              orden: 2,
            },
          },
          {
            nombre: 'notificaciones',
            url: '/admin/notificaciones',
            label: 'Notificaciones',
            propiedades: {
              icono: 'notifications',
              descripcion: 'Notificaciones del sistema',
              orden: 3,
            },
          },
        ],
      },

      // MENU SECCION CONFIGURACIONES
      {
        nombre: 'configuraciones',
        url: '/configuraciones',
        label: 'Configuración',
        propiedades: {
          descripcion: 'Sección de configuraciones',
          orden: 2,
        },
        subMenus: [
          {
            nombre: 'parametros',
            url: '/admin/parametros',
            label: 'Parámetros',
            propiedades: {
              icono: 'tune',
              descripcion: 'Parámetros generales del sistema',
              orden: 2,
            },
          },
          {
            nombre: 'modulos',
            url: '/admin/modulos',
            label: 'Módulos',
            propiedades: {
              icono: 'widgets',
              descripcion: 'Gestión de módulos',
              orden: 3,
            },
          },
          {
            nombre: 'politicas',
            url: '/admin/politicas',
            label: 'Políticas',
            propiedades: {
              icono: 'verified_user',
              descripcion: 'Control de permisos para los usuarios',
              orden: 4,
            },
          },
          {
            nombre: 'rol',
            url: '/admin/roles',
            label: 'Roles',
            propiedades: {
              icono: 'admin_panel_settings',
              descripcion: 'Control de roles para los usuarios',
              orden: 5,
            },
          },
        ],
      },
      {
        nombre: 'organizacion',
        url: '/organizacion',
        label: 'Organización',
        propiedades: {
          descripcion: 'Sección de configuraciones',
          orden: 3,
        },
        subMenus: [
          {
            nombre: 'usuarios',
            url: '/admin/usuarios',
            label: 'Usuarios',
            propiedades: {
              icono: 'manage_accounts',
              descripcion: 'Control de usuarios del sistema',
              orden: 1,
            },
          },
          {
            nombre: 'nutricionistas',
            url: '/admin/nutricionistas',
            label: 'Nutricionistas',
            propiedades: {
              icono: 'assignment',
              descripcion: 'Nutricionistas generales del sistema',
              orden: 2,
            },
          },
          {
            nombre: 'pacientes',
            url: '/admin/pacientes-admin',
            label: 'Pacientes',
            propiedades: {
              icono: 'supervisor_account',
              descripcion: 'Pacientes generales del sistema',
              orden: 3,
            },
          },
        ],
      },
      {
        nombre: 'seguimiento',
        url: '/seguimiento',
        label: 'Seguimiento',
        propiedades: {
          descripcion: 'Sección de configuraciones',
          orden: 3,
        },
        subMenus: [
          {
            nombre: 'pacisntes-asignados',
            url: '/admin/pacientes-asignados',
            label: 'Pacientes asignados',
            propiedades: {
              icono: 'assignment_ind',
              descripcion: 'Pacientes asignados al nutricionista',
              orden: 1,
            },
          },
          {
            nombre: 'citas',
            url: '/admin/citas-nutricionista',
            label: 'Citas programadas',
            propiedades: {
              icono: 'event',
              descripcion: 'Citas programadas por el nutricionista',
              orden: 2,
            },
          },
        ],
      },
    ]

    for (const item of items) {
      const propiedades: Propiedades = {
        orden: item.propiedades.orden,
        descripcion: item.propiedades.descripcion,
      }
      const modulo = await queryRunner.manager.save(
        new Modulo({
          nombre: item.nombre,
          url: item.url,
          label: item.label,
          propiedades: propiedades,
          estado: 'ACTIVO',
          transaccion: 'SEEDS',
          usuarioCreacion: USUARIO_SISTEMA,
        })
      )

      for (const subMenu of item.subMenus) {
        const propiedad: Propiedades = {
          icono: subMenu.propiedades.icono,
          descripcion: subMenu.propiedades.descripcion,
          orden: subMenu.propiedades.orden,
        }
        await queryRunner.manager.save(
          new Modulo({
            nombre: subMenu.nombre,
            url: subMenu.url,
            label: subMenu.label,
            idModulo: modulo.id,
            propiedades: propiedad,
            estado: 'ACTIVO',
            transaccion: 'SEEDS',
            usuarioCreacion: USUARIO_SISTEMA,
          })
        )
      }
    }
  }

  /* eslint-disable */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
