import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'
import { AuthService } from '../auth.service'
import { DoneCallback } from 'passport'

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super({ header: 'x-api-key' }, true, (apikey: string, done: DoneCallback) => {
      const checkKey = authService.validateApiKey(apikey)

      if (checkKey) {
        return done(true)
      } else {
        return done(false)
      }
    })
  }
}
