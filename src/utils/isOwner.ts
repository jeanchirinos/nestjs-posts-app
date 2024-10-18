import { ForbiddenException } from '@nestjs/common'
import { User } from 'src/users/types/user'

type IsOwnerArgs = { currentUserId: User['id']; userId: User['id']; message?: string }

export function isOwner(args: IsOwnerArgs): void {
  const { currentUserId, userId, message } = args

  const userOwnsResource = currentUserId === userId

  if (!userOwnsResource) {
    throw new ForbiddenException(message)
  }
}
