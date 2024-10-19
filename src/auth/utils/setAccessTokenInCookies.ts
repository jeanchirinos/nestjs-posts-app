import { Response } from 'express'
import { COOKIE_JWT_TOKEN } from 'src/constants'

export function setAccessTokenInCookies(res: Response, token: string) {
  res.cookie(COOKIE_JWT_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}
