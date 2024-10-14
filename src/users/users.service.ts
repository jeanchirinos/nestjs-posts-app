import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { User, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { UserSession } from 'src/auth/types/session'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<Omit<User, 'password'> | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      omit: {
        password: true,
      },
    })
  }

  async userWithPassword(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    })
  }

  async users(params: {
    skip?: number
    take?: number
    cursor?: Prisma.UserWhereUniqueInput
    where?: Prisma.UserWhereInput
    orderBy?: Prisma.UserOrderByWithRelationInput
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    })
  }

  getSession(user: User | Omit<User, 'password'>): UserSession {
    const { email, id, name } = user

    return {
      email,
      id,
      name,
    }
  }

  async createUser(data: Prisma.UserCreateInput) {
    const { password, ...otherAttributes } = data

    const hash = await bcrypt.hash(password, 10)

    const newUser = await this.prisma.user.create({
      data: {
        ...otherAttributes,
        password: hash,
      },
    })

    return newUser
  }

  async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
    const { where, data } = params

    return this.prisma.user.update({
      data,
      where,
    })
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    })
  }
}
