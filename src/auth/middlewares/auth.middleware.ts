import { UnauthorizedException } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import * as passport from 'passport'

export function apiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('headerapikey', value => {
    if (value) {
      next()
    } else {
      throw new UnauthorizedException()
    }
  })(req, res, next)
}
