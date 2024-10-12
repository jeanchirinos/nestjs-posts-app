import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.user({ email })

    if (!user) {
      throw new BadRequestException('Email or password is incorrect')
    }

    const isMatch = await bcrypt.compare(pass, user.password)

    if (!isMatch) throw new BadRequestException('Password does not match')

    const { password, ...result } = user

    return result
  }

  async login(user: any) {
    const payload = { email: user.email, id: user.id }

    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  validateApiKey(apiKey: string) {
    return process.env.API_KEY === apiKey
  }
}
