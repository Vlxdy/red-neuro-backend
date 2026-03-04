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
          descripcion: 'Acceso principal al sistema y sus funcionalidades',
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
                'Panel inicial con un resumen general y accesos rápidos del sistema',
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
                'Gestión de la información personal y configuración del usuario autenticado',
              orden: 2,
            },
          },
        ],
      },
      {
        nombre: 'organizacion',
        url: '/organizacion',
        label: 'Organización',
        propiedades: {
          descripcion: 'Configuración estructural y administrativa del sistema',
          orden: 2,
        },
        subMenus: [
          {
            nombre: 'usuarios',
            url: '/admin/usuarios',
            label: 'Usuarios',
            propiedades: {
              icono: 'manage_accounts',
              descripcion:
                'Administración de usuarios, roles y permisos del sistema',
              orden: 1,
            },
          },
          {
            nombre: 'especialidades',
            url: '/admin/especialidades',
            label: 'Especialidades',
            propiedades: {
              icono: 'medical_services',
              descripcion:
                'Gestión de las especialidades médicas disponibles en el sistema',
              orden: 2,
            },
          },
          {
            nombre: 'estudios',
            url: '/admin/estudios',
            label: 'Estudios',
            propiedades: {
              icono: 'medical_services',
              descripcion:
                'Administración de estudios clínicos y procedimientos diagnósticos',
              orden: 3,
            },
          },
          {
            nombre: 'lugares',
            url: '/admin/lugares',
            label: 'Lugares',
            propiedades: {
              icono: 'location_on',
              descripcion:
                'Gestión de lugares físicos asociados a la atención médica, como clínicas, hospitales o centros de salud',
              orden: 3,
            },
          },
        ],
      },
      {
        nombre: 'Pacientes',
        url: '/pacientes-del-sistema',
        label: 'Pacientes',
        propiedades: {
          descripcion: 'Gestión integral de pacientes y su historial clínico',
          orden: 3,
        },
        subMenus: [
          {
            nombre: 'lista-pacientes',
            url: '/admin/pacientes',
            label: 'Pacientes',
            propiedades: {
              icono: 'assignment_ind',
              descripcion:
                'Listado general de pacientes registrados en el sistema',
              orden: 1,
            },
          },
          {
            nombre: 'citas',
            url: '/admin/citas',
            label: 'Citas',
            propiedades: {
              icono: 'event',
              descripcion:
                'Administración y seguimiento de citas médicas programadas',
              orden: 2,
            },
          },
        ],
      },
      {
        nombre: 'Personal',
        url: '/personal-del-sistema',
        label: 'Personal',
        propiedades: {
          descripcion: 'Gestión del personal médico y administrativo',
          orden: 4,
        },
        subMenus: [
          {
            nombre: 'personal-salud',
            url: '/admin/personal_medico',
            label: 'Personal',
            propiedades: {
              icono: 'assignment_ind',
              descripcion:
                'Listado y gestión del personal de salud asociado al sistema',
              orden: 1,
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
