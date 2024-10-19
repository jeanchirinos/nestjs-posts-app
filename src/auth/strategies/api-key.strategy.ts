import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { HeaderAPIKeyStrategy } from 'passport-headerapikey'
import { AuthService } from '../auth.service'
import { DoneCallback } from 'passport'
import { API_KEY_HEADER } from 'src/constants'

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super({ header: API_KEY_HEADER }, true, (apikey: string, done: DoneCallback) => {
      // const checkKey = authService.validateApiKey(apikey)
      const checkKey = true

      if (checkKey) {
        return done(true)
      } else {
        return done(false)
      }
    })
  }
}
