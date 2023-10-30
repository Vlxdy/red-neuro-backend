import dayjs from 'dayjs'

export function timeToPrint() {
  return dayjs().format('YYYY-MM-DD HH:mm:ss.SSS')
}
