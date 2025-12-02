import { Module } from '@nestjs/common'
import { SwaggerErrorsDocumentationController } from './swagger-errors.docs'

@Module({
  controllers: [SwaggerErrorsDocumentationController],
})
export class SwaggerDocsModule {}
