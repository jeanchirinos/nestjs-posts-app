import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserSession } from 'src/auth/types/session'

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()

  return request.user satisfies UserSession
})
