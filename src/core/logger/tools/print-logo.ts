import { COLOR } from '../constants'
import { stdoutWrite } from './stdout-write'

export function printLogo(logo: string) {
  const toPrint = logo.replace(/\n/g, `\n${COLOR.LIGHT_GREY}`)
  stdoutWrite(`${COLOR.LIGHT_GREY}${toPrint}${COLOR.RESET}\n`)
}
