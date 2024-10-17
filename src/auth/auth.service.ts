import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { User } from 'src/users/types/user'
import { UsersService } from 'src/users/users.service'
import { UserSession } from './types/session'

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

  async validateUser(email: string, pass: string): Promise<UserSession | null> {
    const user = await this.usersService.userWithPassword({ email })

    if (!user) return null

    const isMatch = await bcrypt.compare(pass, user.password)

    if (!isMatch) return null

    const sessionData = this.getSession(user)

    return sessionData
  }

  async login(user: User | UserSession): Promise<{
    access_token: string
    user: UserSession
  }> {
    const userSession = this.getSession(user)

    const { id, ...userWithoutId } = userSession

    const payload = { sub: id.toString(), ...userWithoutId }

    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }

  async session(id: number): Promise<UserSession> {
    const user = await this.usersService.user({ id })

    const session = this.getSession(user)

    return session
  }

  validateApiKey(apiKey: string): boolean {
    return process.env.API_KEY === apiKey
  }
}
