import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import { Request } from 'express'
import { Strategy } from 'passport-local'
import { throwValidationException } from 'src/utils/getValidationException'
import { AuthService } from '../auth.service'
import { LoginDto } from '../dtos/login.dto'
import { UserSession } from '../types/session'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  authenticate(req: Request, options?: any) {
    const loginDto = plainToClass(LoginDto, req.body)
    const errors = validateSync(loginDto)

    if (errors.length > 0) {
      throwValidationException(errors)
    }

    super.authenticate(req, options)
  }

  async validate(email: string, password: string): Promise<UserSession> {
    const user = await this.authService.validateUser(email, password)

    if (!user) throw new UnauthorizedException('Invalid credentials')

    return user
  }
}
