import { applyDecorators } from '@nestjs/common'
import { ApiSecurity } from '@nestjs/swagger'
import { API_KEY_HEADER } from 'src/constants'

export function ApiKeyAuth() {
  return applyDecorators(ApiSecurity(API_KEY_HEADER))
}
