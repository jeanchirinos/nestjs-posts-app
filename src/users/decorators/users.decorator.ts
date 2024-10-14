import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserSession } from 'src/auth/types/session'

export const CurrentUser = createParamDecorator((_, ctx: ExecutionContext): UserSession => {
  const { user } = ctx.switchToHttp().getRequest<{ user: UserSession }>()

  return user
})
