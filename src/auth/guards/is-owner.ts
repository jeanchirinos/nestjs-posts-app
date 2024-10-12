import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class IsOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const { id } = request.user
    const { userId } = request.params

    return Number(userId) === id
  }
}
