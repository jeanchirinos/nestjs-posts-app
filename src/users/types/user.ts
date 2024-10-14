import { User as BaseUser } from '@prisma/client'

export type UserWithPassword = BaseUser

export type User = Omit<BaseUser, 'password'>
