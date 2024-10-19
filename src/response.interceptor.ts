import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { RESPONSE_MESSAGE_METADATA } from './response-message.decorator'

type Response<T> = {
  statusCode: number
  timestamp: string
  path: string
  message: string
  data: T
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((res: unknown) => this.responseHandler(res, context)))
  }

  responseHandler(res: any, context: ExecutionContext): Response<T> {
    const ctx = context.switchToHttp()

    const { statusCode } = ctx.getResponse<{ statusCode: number }>()

    const { url } = ctx.getRequest<{ url: string }>()

    const timestamp = new Date().toISOString()

    const message = this.reflector.get<string>(RESPONSE_MESSAGE_METADATA, context.getHandler()) ?? 'Success'

    const responseBody = {
      statusCode,
      timestamp,
      path: url,
      message,
      data: res,
    }

    return responseBody
  }
}
