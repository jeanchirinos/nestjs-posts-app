import { User } from 'src/users/types/user'

export function isOwner({ currentUserId, userId }: { currentUserId: User['id']; userId: User['id'] }): boolean {
  return currentUserId === userId
}
