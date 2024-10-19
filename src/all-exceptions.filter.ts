import { ArgumentsHost, Catch, HttpException, HttpServer, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

type Response = {
  statusCode: number
  timestamp: string
  path: string
  message: string
}

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const httpAdapter = this.applicationRef as HttpServer<string, number, boolean>
    const ctx = host.switchToHttp()

    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const timestamp = new Date().toISOString()

    const path = httpAdapter.getRequestUrl(ctx.getRequest())

    const message = exception instanceof HttpException ? exception.message : 'Internal server error'

    const responseBody = {
      statusCode,
      timestamp,
      path,
      message,
    } satisfies Response

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode)

    super.catch(exception, host)
  }
}
