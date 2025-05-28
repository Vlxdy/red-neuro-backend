import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import weekday from 'dayjs/plugin/weekday'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isBetween)
dayjs.extend(weekday)
dayjs.extend(isoWeek)

type Cita = { inicio: string; fin: string }

export function generarCitasSinSolapamiento(
  fechaBase: string,
  citasExistentes: Cita[]
): Cita[] {
  const nuevasCitas: Cita[] = []
  const base = dayjs(fechaBase).startOf('day').weekday(1) // lunes de esa semana

  for (let semana = 0; semana < 5; semana++) {
    const semanaInicio = base.add(semana, 'week')
    let citaAgendada = false

    // 1. Intento inicial aleatorio
    for (let intento = 0; intento < 5; intento++) {
      const dia = Math.floor(Math.random() * 5) // lunes a viernes
      const hora = Math.floor(Math.random() * 10) + 8 // 8 a 17

      const inicio = semanaInicio.add(dia, 'day').hour(hora).minute(0).second(0)
      const fin = inicio.minute(59)

      const conflicto = citasExistentes.concat(nuevasCitas).some((cita) => {
        const inicioExistente = dayjs(cita.inicio)
        const finExistente = dayjs(cita.fin)
        return inicio.isBefore(finExistente) && fin.isAfter(inicioExistente)
      })

      if (!conflicto) {
        nuevasCitas.push({
          inicio: inicio.format('YYYY-MM-DD HH:mm'),
          fin: fin.format('YYYY-MM-DD HH:mm'),
        })
        citaAgendada = true
        break
      }
    }

    // 2. Si no pudo agendar aleatoriamente, intentar por fuerza bruta
    if (!citaAgendada) {
      const slots: { inicio: dayjs.Dayjs; fin: dayjs.Dayjs }[] = []

      for (let dia = 0; dia < 5; dia++) {
        for (let h = 8; h <= 17; h++) {
          const inicio = semanaInicio
            .add(dia, 'day')
            .hour(h)
            .minute(0)
            .second(0)
          const fin = inicio.minute(59)
          slots.push({ inicio, fin })
        }
      }

      shuffle(slots)

      for (const slot of slots) {
        const conflicto = citasExistentes.concat(nuevasCitas).some((cita) => {
          const inicioExistente = dayjs(cita.inicio)
          const finExistente = dayjs(cita.fin)
          return (
            slot.inicio.isBefore(finExistente) &&
            slot.fin.isAfter(inicioExistente)
          )
        })

        if (!conflicto) {
          nuevasCitas.push({
            inicio: slot.inicio.format('YYYY-MM-DD HH:mm'),
            fin: slot.fin.format('YYYY-MM-DD HH:mm'),
          })
          citaAgendada = true
          break
        }
      }
    }

    if (!citaAgendada) {
      console.warn(
        `⚠️  No se pudo agendar una cita para la semana ${semana + 1}.`
      )
    }
  }

  return nuevasCitas
}

// Barajado estilo Fisher-Yates
function shuffle<T>(array: T[]): T[] {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
