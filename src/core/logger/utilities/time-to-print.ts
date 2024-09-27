import dayjs from 'dayjs'

export function timeToPrint(fecha?: Date) {
  return dayjs(fecha).format('YYYY-MM-DD HH:mm:ss.SSS')
}
