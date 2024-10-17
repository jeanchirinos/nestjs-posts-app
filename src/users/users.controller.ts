import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { ApiKeyAuth } from 'src/auth/decorators/api-key-swagger.decorator'
import { UserSession } from 'src/auth/types/session'
import { CurrentUser } from './decorators/users.decorator'
import { UsersService } from './users.service'

@ApiTags('users')
@Controller('users')
@ApiKeyAuth()
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@CurrentUser() user: UserSession) {
    const profile = await this.usersService.user({ id: user.id })

    return profile
  }
}
