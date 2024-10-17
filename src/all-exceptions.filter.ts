import { ArgumentsHost, Catch, HttpException, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const httpAdapter = this.applicationRef
    const ctx = host.switchToHttp()

    // Determine the HTTP status code
    const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    const path = httpAdapter.getRequestUrl(ctx.getRequest())

    const message = exception instanceof HttpException ? exception.message : 'Internal server error'

    // Create the response body
    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      message,
    }

    // Send the response
    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode)

    super.catch(exception, host)
  }
}
