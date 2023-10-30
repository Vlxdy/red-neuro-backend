import { COLOR } from '../constants'
import { stdoutWrite } from '../tools'
import { LoggerParams } from '../types'

export function printLoggerParams(loggerParams: LoggerParams) {
  stdoutWrite(
    `\n${COLOR.LIGHT_GREY} ┌──────── Logger Service ───────── ...${COLOR.RESET}\n`
  )
  Object.keys(loggerParams)
    .filter(
      (key) =>
        key !== 'fileParams' &&
        key !== 'lokiParams' &&
        key !== 'auditParams' &&
        key !== '_levels' &&
        key !== '_audit' &&
        key !== 'hide' &&
        key !== 'console' &&
        key !== 'excludeOrigen'
    )
    .forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${loggerParams[property]}${COLOR.RESET}\n`
      )
    })
  if (loggerParams.fileParams) {
    const params = loggerParams.fileParams
    stdoutWrite(
      `${COLOR.LIGHT_GREY} ├──────── File params ──────────── ...${COLOR.RESET}\n`
    )
    Object.keys(params).forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${params[property]}${COLOR.RESET}\n`
      )
    })
  }
  if (loggerParams.auditParams) {
    const params = loggerParams.auditParams
    stdoutWrite(
      `${COLOR.LIGHT_GREY} ├──────── Audit params ─────────── ...${COLOR.RESET}\n`
    )
    Object.keys(params).forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${params[property]}${COLOR.RESET}\n`
      )
    })
  }
  if (loggerParams.lokiParams) {
    const params = loggerParams.lokiParams
    stdoutWrite(
      `${COLOR.LIGHT_GREY} ├──────── Loki params ──────────── ...${COLOR.RESET}\n`
    )
    Object.keys(params).forEach((property) => {
      stdoutWrite(
        ` ${COLOR.LIGHT_GREY}│${COLOR.RESET} ${String(property).padEnd(17)}` +
          `${COLOR.LIGHT_GREY}│${COLOR.RESET} ${COLOR.CYAN}${params[property]}${COLOR.RESET}\n`
      )
    })
  }
  stdoutWrite(
    `${COLOR.LIGHT_GREY} └───────────────────────────────── ...${COLOR.RESET}\n\n`
  )
}
