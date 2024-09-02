import { Controller, Get, Request } from '@nestjs/common'

@Controller('user')
export class UserController {
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
