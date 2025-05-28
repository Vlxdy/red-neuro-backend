import { Genero, TipoDocumento, USUARIO_SISTEMA } from '@/common/constants'
import { TextService } from '@/common/lib/text.service'
import { UsuarioRol } from '@/core/authorization/entity/usuario-rol.entity'
import { Persona } from '@/core/usuario/entity/persona.entity'
import { Usuario } from '@/core/usuario/entity/usuario.entity'
import dayjs from 'dayjs'
import { MigrationInterface, QueryRunner } from 'typeorm'

interface PersonaI {
  nombres: string
  primerApellido: string
  segundoApellido: string
  tipoDocumento: TipoDocumento
  nroDocumento: string
  fechaNacimiento: string
  genero: Genero
  telefono: string
}

interface UsuarioI {
  usuario: string
  correoElectronico: string
  persona: PersonaI
}

function numeroAleatorioEntre(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
const ApellidosPaceños = [
  'Quispe',
  'Mamani',
  'Condori',
  'Choque',
  'Copa',
  'Colque',
  'Huanca',
  'Laura',
  'Apaza',
  'Flores',
  'Yana',
  'Callisaya',
  'Aliaga',
  'Cusi',
  'Aruquipa',
  'Loayza',
  'Poma',
  'Catari',
  'Cutipa',
  'Zeballos',
  'Canaviri',
  'Paucara',
  'Chura',
  'Ramos',
  'Soria',
  'Vargas',
  'Gutiérrez',
  'Ticona',
  'Aramayo',
  'Mayta',
  'Llanque',
  'Aguirre',
  'Torrez',
  'Valencia',
  'Espinoza',
  'Zárate',
  'Gonzales',
  'Velasco',
  'Pérez',
  'Medrano',
  'Alarcón',
  'Chambi',
  'Chino',
  'Anavi',
  'Quenta',
  'Callapa',
  'Llusco',
  'Cari',
  'Paredes',
  'Fernández',
  'Salazar',
  'Barrientos',
  'Villca',
  'Paz',
  'Torrico',
  'Rocabado',
  'López',
  'Camacho',
  'Morales',
  'Machaca',
  'Coarite',
  'Chávez',
  'Alí',
  'Villanueva',
  'Escobar',
  'Orellana',
  'Mendoza',
  'Rivera',
  'Céspedes',
  'Zalles',
  'Rojas',
  'Navia',
  'Sánchez',
  'Huarachi',
  'Cahuana',
  'Guzmán',
  'Llanos',
  'Villegas',
  'Salinas',
  'Montero',
  'García',
  'Condorena',
  'Ibarra',
  'Churata',
  'Nina',
  'Pillco',
  'Miranda',
  'Camata',
  'Avendaño',
  'Tórrez',
  'Calisaya',
  'Lima',
  'Llanque',
  'Beltrán',
  'Quenta',
  'Ticona',
  'Illanes',
  'Barrón',
  'Uría',
  'Nogales',
  'Yapu',
  'Tola',
  'Medina',
  'Ramos',
  'Tito',
  'Silva',
  'Paucara',
  'Achocalla',
]
const nombresPaceños: Array<{ nombre: string; genero: Genero }> = [
  {
    nombre: 'Esteban',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'José',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Paola',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Samuel',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Marco',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Gabriela',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Andrés',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Pedro',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Martín',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Toribia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Bartolina',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Mónica',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Karen',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Vicente',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Freddy',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Ramiro',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Tatiana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Diana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'María',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Jhoselyn',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Ismael',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Carlos',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Lidia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Zenón',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Sofía',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Yesenia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Herminia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Dayana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Luis',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Zenobia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Brayan',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Teófilo',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Domitila',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Liliana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Nelson',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Édgar',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Carla',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Alejo',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Jhaneth',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Hilaria',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Rosmery',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Óscar',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Nicolasa',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Joaquín',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Fernando',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Cristian',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Alejandra',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Raúl',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Valeria',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Ana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Verónica',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Jessica',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Jhonny',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Clodomiro',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Rodolfo',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Inés',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Álvaro',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Camila',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Nataly',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Renzo',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Gregoria',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Gabriel',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Felipa',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Eulogio',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Pablo',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Adela',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Roxana',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Jorge',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Kevin',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Víctor',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Andrea',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Daniel',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Lucía',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Oscar',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Miguel',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Juan',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Ignacia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Macario',
    genero: Genero.MASCULINO,
  },
  {
    nombre: 'Patricia',
    genero: Genero.FEMENINO,
  },
  {
    nombre: 'Vanessa',
    genero: Genero.FEMENINO,
  },
]
// function generarCI(departamento = 'LP') {
//   // Los departamentos válidos para agregar al final
//   const sufijos = ['LP', 'CB', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PA']

//   // Elegimos el sufijo si no se proporciona uno válido
//   if (!sufijos.includes(departamento)) {
//     departamento = sufijos[Math.floor(Math.random() * sufijos.length)]
//   }

//   // Número aleatorio de entre 6 y 8 dígitos
//   const numero = Math.floor(Math.random() * 9_000_000) + 1_000_000

//   // Retornar en formato típico boliviano
//   return `${numero}-${departamento}`
// }
function generarCelularBoliviano() {
  // Los celulares en Bolivia inician con 6 o 7 y tienen 8 dígitos
  const prefijos = ['6', '7'] // 6 para líneas tradicionales, 7 para nuevas

  const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)]
  const resto = Math.floor(Math.random() * 1_000_0000)
    .toString()
    .padStart(7, '0')

  return `${prefijo}${resto}`
}
function generarFechaNacimiento(): string {
  const hoy = new Date()
  const edadMin = 5
  const edadMax = 40

  // Convertimos años en milisegundos para usarlo como rango
  const msPorAnio = 365.25 * 24 * 60 * 60 * 1000

  const ahora = hoy.getTime()
  const maxTimestamp = ahora - edadMin * msPorAnio
  const minTimestamp = ahora - edadMax * msPorAnio

  // Fecha aleatoria entre esos dos rangos
  const fechaAleatoria = new Date(
    minTimestamp + Math.random() * (maxTimestamp - minTimestamp)
  )

  // Retornar como YYYY-MM-DD
  return fechaAleatoria.toISOString().split('T')[0]
}
type NombreGenero = { nombre: string; genero: Genero }
function generarPersonaAleatoria(
  nombresConGenero: NombreGenero[],
  apellidos: string[]
): {
  nombres: string
  primerApellido: string
  segundoApellido: string
  genero: Genero
} {
  // Filtrar nombres por género
  const generos: Genero[] = [Genero.MASCULINO, Genero.FEMENINO]
  const generoElegido = generos[Math.floor(Math.random() * generos.length)]

  const nombresFiltrados = nombresConGenero.filter(
    (n) => n.genero === generoElegido
  )

  // Elegir 1 o 2 nombres del mismo género
  const cantidadNombres = Math.random() < 0.5 ? 1 : 2
  const nombresSeleccionados = shuffleArray(nombresFiltrados).slice(
    0,
    cantidadNombres
  )

  // Elegir 2 apellidos diferentes
  const apellidosUnicos = shuffleArray(apellidos).slice(0, 2)

  return {
    nombres: nombresSeleccionados.map((n) => n.nombre).join(' '),
    primerApellido: apellidosUnicos[0],
    segundoApellido: apellidosUnicos[1],
    genero: generoElegido,
  }
}

// Función auxiliar para mezclar arrays
function shuffleArray<T>(array: T[]): T[] {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function generarCorreoElectronico(
  nombres: string,
  primerApellido: string,
  carnet: string
): string {
  // Extraer primer nombre y primer apellido
  const nombre = nombres.trim().split(' ')[0].toLowerCase()

  // Extraer últimos 3 dígitos del CI (sin sufijo de departamento)
  const soloNumero = carnet.split('-')[0]
  const codigo = soloNumero.slice(-3)

  // Proveedores de correo comunes en Bolivia
  const dominios = ['gmail.com', 'hotmail.com', 'yahoo.com', 'protonmail.com']
  const dominio = dominios[Math.floor(Math.random() * dominios.length)]

  // Ensamblar correo
  return `${nombre}.${primerApellido}${codigo}@${dominio}`
}
export class PacientesTest1741134363368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (String(process.env.NODE_ENV) === 'production') return

    const DEFAULT_PASS = '123'
    const pass = await TextService.encrypt(DEFAULT_PASS)

    const items: UsuarioI[] = []

    for (let i = 0; i < 100; i++) {
      const { nombres, primerApellido, segundoApellido, genero } =
        generarPersonaAleatoria(nombresPaceños, ApellidosPaceños)
      const nroDocumento = numeroAleatorioEntre(1000000, 9999999).toString()

      items.push({
        usuario: nroDocumento,
        correoElectronico: generarCorreoElectronico(
          nombres,
          primerApellido,
          nroDocumento
        ),
        persona: {
          nombres: nombres.toUpperCase(),
          primerApellido: primerApellido.toUpperCase(),
          segundoApellido: segundoApellido.toUpperCase(),
          tipoDocumento: TipoDocumento.CI,
          nroDocumento: nroDocumento,
          fechaNacimiento: generarFechaNacimiento(),
          genero,
          telefono: generarCelularBoliviano(),
        },
      })
    }

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
        ciudadaniaDigital: false,
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
