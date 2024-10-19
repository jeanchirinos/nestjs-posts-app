import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { UserSession } from '../types/session'
import { Request } from 'express'
import { COOKIE_JWT_TOKEN } from 'src/constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), JwtStrategy.extractJWT]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && COOKIE_JWT_TOKEN in req.cookies && req.cookies[COOKIE_JWT_TOKEN].length > 0) {
      return req.cookies[COOKIE_JWT_TOKEN]
    }

    return null
  }

  async validate(payload: { sub: string; iat: number; exp: number } & Omit<UserSession, 'id'>): Promise<UserSession> {
    const { exp, iat, sub, ...session } = payload

    return {
      id: Number(sub),
      ...session,
    }
  }
}
