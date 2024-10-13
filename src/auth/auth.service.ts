import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.user({ email })

    if (!user) {
      throw new BadRequestException('Email or password is incorrect')
    }

    const isMatch = await bcrypt.compare(pass, user.password)

    if (!isMatch) throw new BadRequestException('Password does not match')

    const sessionData = this.usersService.getSessionData(user)

    return sessionData
  }

  async login(user: User) {
    const payload = { email: user.email, id: user.id }

    const sessionData = this.usersService.getSessionData(user)

    return {
      access_token: this.jwtService.sign(payload),
      user: sessionData,
    }
  }

  async session(id: number) {
    const user = await this.usersService.user({ id })

    const session = this.usersService.getSessionData(user)

    return session
  }

  validateApiKey(apiKey: string) {
    return process.env.API_KEY === apiKey
  }
}
