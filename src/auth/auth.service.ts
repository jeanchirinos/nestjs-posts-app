import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import { UserSession } from './types/session'
import { User } from 'src/users/types/user'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private getSession(user: Pick<User, 'email' | 'id' | 'name'>): UserSession {
    const { email, id, name } = user

    return {
      email,
      id,
      name,
    }
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.userWithPassword({ email })

    if (!user) {
      throw new BadRequestException('Email or password is incorrect')
    }

    const isMatch = await bcrypt.compare(pass, user.password)

    if (!isMatch) throw new BadRequestException('Password does not match')

    const sessionData = this.getSession(user)

    return sessionData
  }

  async login(user: User | UserSession) {
    const userSession = this.getSession(user)

    const { id, ...userWithoutId } = userSession

    const payload = { sub: id.toString(), ...userWithoutId }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }

  async session(id: number) {
    const user = await this.usersService.user({ id })

    const session = this.getSession(user)

    return session
  }

  validateApiKey(apiKey: string) {
    return process.env.API_KEY === apiKey
  }
}
