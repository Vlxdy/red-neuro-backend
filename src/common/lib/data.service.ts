import dayjs from 'dayjs'

export class DateService {
  static days = dayjs()
  static fechaActual() {
    return dayjs().format('DD/MM/YYYY HH:mm:ss')
  }

  static calculateAge(birthDateString?: string | null | Date): number {
    if (!birthDateString) return 0
    const birthDate = dayjs(birthDateString)
    if (!birthDate.isValid()) {
      throw new Error('Fecha de nacimiento inválida')
    }
    const now = dayjs()
    let age = now.year() - birthDate.year()
    // Verifica si aún no ha cumplido años en el año actual
    if (
      now.month() < birthDate.month() ||
      (now.month() === birthDate.month() && now.date() < birthDate.date())
    ) {
      age--
    }
    return age
  }
}
