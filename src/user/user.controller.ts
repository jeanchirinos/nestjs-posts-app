import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user
  }
}
