import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { UserSession } from '../types/session'

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ user: UserSession; params: { userId: string } }>()
    const { id } = request.user
    const { userId } = request.params

    return Number(userId) === id
  }
}
