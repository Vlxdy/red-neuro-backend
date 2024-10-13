import { LoggerService } from '../classes'

/**
 * Devuelve una cadena del tipo:
 * at AppController.verificarEstado (/home/user/project/src/app.controller.ts:19:17)
 * @param errorStack
 * @param salto
 * @returns string
 */
export function getOrigen(errorStack: string, salto: number = 0): string {
  const loggerParams = LoggerService.getLoggerParams()
  const projectPath = loggerParams?.projectPath || ''
  return (
    errorStack
      .split('\n')
      .filter(
        (x) =>
          x.includes(projectPath) &&
          !loggerParams?.excludeOrigen?.some((y) => x.includes(y))
      )
      .at(salto) || ''
  ).trim()
}

/**
 * Devuelve una cadena del tipo:
 * AppController.verificarEstado (app.controller.ts:19:17)
 * @param origen
 * @returns string
 */
export function extraerOrigenSimplificado(origen: string): string {
  const archivo = origen.split('/').pop()?.slice(0, -1) || ''
  const metodo = origen.replace('at ', '').split(' ').shift() || ''
  return `${metodo} (${archivo})`
}
