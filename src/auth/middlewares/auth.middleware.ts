import { UnauthorizedException } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import * as passport from 'passport'

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('headerapikey', (value: boolean) => {
    if (value) {
      next()
    } else {
      const objectError = process.env.NODE_ENV === 'development' ? 'API Key is invalid' : undefined

      throw new UnauthorizedException(objectError)
    }
  })(req, res, next)
}
