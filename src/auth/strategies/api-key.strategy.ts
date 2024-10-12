import { HeaderAPIKeyStrategy } from 'passport-headerapikey'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { AuthService } from '../auth.service'

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor(private authService: AuthService) {
    super({ header: 'x-api-key' }, true, (apikey, done) => {
      const checkKey = authService.validateApiKey(apikey)

      if (checkKey) return done(true)

      return done(false)
    })
  }
}
