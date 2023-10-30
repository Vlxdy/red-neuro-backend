import { LoggerService } from '../classes'

export function getOrigen(errorStack: string): string {
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
      .shift() || ''
  ).trim()
}
