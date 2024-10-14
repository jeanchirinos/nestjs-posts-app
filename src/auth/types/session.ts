import { User } from '@prisma/client'

export type UserSession = Pick<User, 'id' | 'email' | 'name'>
