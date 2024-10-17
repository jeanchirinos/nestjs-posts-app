import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { UserSession } from 'src/auth/types/session'

@ApiTags('users')
@Controller('users')
@ApiSecurity('bearer')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: UserSession) {
    const profile = await this.usersService.user({ id: user.id })

    return profile
  }
}
