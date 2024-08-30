import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Response } from 'express'
import { UserService } from 'src/user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.usersService.user({ email })

    if (user?.password !== password) {
      throw new UnauthorizedException()
    }

    const payload = { sub: user.id, email: user.email }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    })

    return {
      access_token: accessToken,
    }
  }
}
