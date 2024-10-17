import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type Response<T> = {
  statusCode: number
  path: string
  message: string
  data: T
  timestamp: string
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((res: unknown) => this.responseHandler(res, context)))
  }

  responseHandler(res: any, context: ExecutionContext) {
    const ctx = context.switchToHttp()
    const { statusCode } = ctx.getResponse<{ statusCode: number }>()
    const { url } = ctx.getRequest<{ url: string }>()

    const { message: resMessage, ...data } = res

    const timestamp = new Date().toISOString()
    const message = resMessage ?? 'Success'

    return {
      statusCode,
      timestamp,
      path: url,
      message,
      data,
    }
  }
}
