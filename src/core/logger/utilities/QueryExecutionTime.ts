import { EntitySubscriberInterface, EventSubscriber } from 'typeorm'
import { LoggerService } from '../classes'
import { stdoutWrite } from '../tools'
import {
  AfterQueryEvent,
  BeforeQueryEvent,
} from 'typeorm/subscriber/event/QueryEvent'
import { COLOR } from '../constants'

const TIEMPO_MAXIMO_EJECUCION_MS = 1000

@EventSubscriber()
export class QueryExecutionTime implements EntitySubscriberInterface<unknown> {
  private logger = LoggerService.getInstance()

  private executionTimes: Map<string, number> = new Map()

  private start(event: BeforeQueryEvent<unknown>): void {
    const id = this.getQueryRunnerId(event)
    this.executionTimes.set(id, Date.now())
  }

  private end(event: BeforeQueryEvent<unknown>, operation: string): void {
    const id = this.getQueryRunnerId(event)
    const startTime = this.executionTimes.get(id)
    if (startTime) {
      const endTime = Date.now()
      const executionTime = endTime - startTime
      if (executionTime > TIEMPO_MAXIMO_EJECUCION_MS) {
        this.logger.auditWarn(
          'application',
          `${operation} TIEMPO DE EJECUCIÓN: ${executionTime}ms\n`,
          { tiempoEjecucionMs: executionTime, consulta: event.query }
        )
      } else {
        stdoutWrite(
          `${COLOR.LIGHT_GREY}${operation} TIEMPO DE EJECUCIÓN: ${executionTime}ms${COLOR.RESET}\n`
        )
      }
      this.executionTimes.delete(id)
    }
  }

  private getQueryRunnerId(event: BeforeQueryEvent<unknown>): string {
    if (!event.queryRunner) {
      return 'default'
    }

    if ('queryId' in event.queryRunner) {
      return String(event.queryRunner.queryId)
    }

    if (
      'connection' in event.queryRunner &&
      'id' in event.queryRunner.connection
    ) {
      return String(event.queryRunner.connection.id)
    }

    return 'default'
  }

  /**
   * Called before query execution.
   */
  beforeQuery(event: BeforeQueryEvent<unknown>) {
    // if(process.env.)
    this.start(event)
  }

  /**
   * Called after query execution.
   */
  afterQuery(event: AfterQueryEvent<unknown>) {
    this.end(event, 'QUERY')
  }
}
