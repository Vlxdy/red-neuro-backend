import { Genero } from '@/common/constants'

interface DatosPrevios {
  edad?: number
  alturaAnterior?: number
  pesoAnterior?: number
  imcAnterior?: number
  pesoObjetivoAnterior?: number
}

export interface DatosNutricionalesFake {
  edad: number
  genero: Genero
  altura: string // en formato "170 cm"
  peso: string // en formato "65 kg"
  imc: number
  clasificacion: string
  pesoObjetivo: string // en formato "60 kg"
  comentario: string
}

function calcularPesoObjetivo(genero: Genero, alturaCm: number): number {
  return +(
    genero === Genero.MASCULINO
      ? 50 + 0.75 * (alturaCm - 150)
      : 45.5 + 0.67 * (alturaCm - 150)
  ).toFixed(1)
}

export function generarDiagnosticoNutricional(
  genero: Genero,
  datosPrevios?: DatosPrevios
): DatosNutricionalesFake {
  const edad =
    datosPrevios?.edad ?? Math.floor(Math.random() * (70 - 15 + 1)) + 15

  // ALTURA
  let alturaCm: number
  // if (datosPrevios?.alturaAnterior !== undefined) {
  //   if (edad >= 18) {
  //     alturaCm = datosPrevios.alturaAnterior
  //   } else {
  //     const crecimientoMax = 2 * (18 - edad)
  //     const crecimiento = Math.floor(Math.random() * (crecimientoMax + 1))
  //     alturaCm = datosPrevios.alturaAnterior + crecimiento
  //   }
  // } else {
  //   alturaCm =
  //     genero === Genero.MASCULINO
  //       ? Math.floor(Math.random() * (190 - 165 + 1)) + 165
  //       : Math.floor(Math.random() * (180 - 150 + 1)) + 150
  // }

  if (datosPrevios?.alturaAnterior !== undefined) {
    if (edad >= 18) {
      alturaCm = datosPrevios.alturaAnterior
    } else {
      const crecimientoMax = 2 * (18 - edad)
      const crecimiento = Math.floor(Math.random() * (crecimientoMax + 1))
      alturaCm = datosPrevios.alturaAnterior + crecimiento
    }
  } else {
    alturaCm =
      genero === Genero.MASCULINO
        ? Math.floor(Math.random() * (180 - 160 + 1)) + 160 // La Paz hombres
        : Math.floor(Math.random() * (170 - 145 + 1)) + 145 // La Paz mujeres
  }

  // PESO
  let pesoKg: number
  if (datosPrevios?.pesoAnterior !== undefined) {
    const variacion = Math.floor(Math.random() * 11) - 5
    pesoKg = Math.max(30, datosPrevios.pesoAnterior + variacion)
  } else {
    pesoKg =
      genero === Genero.MASCULINO
        ? Math.floor(Math.random() * (100 - 60 + 1)) + 60
        : Math.floor(Math.random() * (90 - 45 + 1)) + 45
  }

  const alturaM = alturaCm / 100
  const imc = +(pesoKg / (alturaM * alturaM)).toFixed(1)

  let clasificacion = ''
  if (imc < 18.5) clasificacion = 'Bajo peso'
  else if (imc < 25) clasificacion = 'Peso normal'
  else if (imc < 30) clasificacion = 'Sobrepeso'
  else if (imc < 35) clasificacion = 'Obesidad grado I'
  else if (imc < 40) clasificacion = 'Obesidad grado II'
  else clasificacion = 'Obesidad grado III'

  // PESO OBJETIVO
  const recalcularPesoObjetivo =
    datosPrevios?.pesoObjetivoAnterior === undefined ||
    datosPrevios.alturaAnterior !== alturaCm ||
    datosPrevios.edad !== edad
  const pesoObjetivo = recalcularPesoObjetivo
    ? calcularPesoObjetivo(genero, alturaCm)
    : datosPrevios.pesoObjetivoAnterior!

  let comentario = ''
  if (datosPrevios?.imcAnterior) {
    if (imc > datosPrevios.imcAnterior + 1) {
      comentario =
        'Tu IMC ha aumentado. Podría reflejar cambios desfavorables en tu estilo de vida.'
    } else if (imc < datosPrevios.imcAnterior - 1) {
      comentario = 'Tu IMC ha mejorado, lo cual es positivo. ¡Sigue así!'
    } else {
      comentario = 'Tu IMC se mantiene estable. La constancia es clave.'
    }
  } else {
    comentario =
      'Este es tu primer diagnóstico. A partir de ahora se evaluarán los cambios con mayor precisión.'
  }

  return {
    edad,
    genero,
    altura: `${alturaCm} cm`,
    peso: `${pesoKg} kg`,
    imc,
    clasificacion,
    pesoObjetivo: `${pesoObjetivo} kg`,
    comentario,
  }
}
