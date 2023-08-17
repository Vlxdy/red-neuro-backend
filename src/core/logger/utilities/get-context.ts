import { LoggerService } from '../classes'

export function getContext(saltar = 4): string {
  try {
    const loggerParams = LoggerService.getLoggerParams()
    const projectPath = loggerParams?.projectPath
    const originalStack = String(new Error().stack)
    const context = originalStack
      .split('\n')
      .slice(saltar)
      .map((line) =>
        projectPath ? line.replace(new RegExp(projectPath, 'g'), '...') : line
      )
      .filter((line) => line.includes('.../'))
      .map((line) => line.split('/').pop()?.slice(0, -1))
      .shift()
    return context || '-'
  } catch (e) {
    return '-'
  }
}
