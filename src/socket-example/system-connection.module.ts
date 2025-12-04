import { Module } from '@nestjs/common'
import { SystemConnectionGateway } from './system-connection.gateway'

@Module({
  providers: [SystemConnectionGateway],
})
export class SystemConnectionModule {}
