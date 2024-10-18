import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ApiKeyAuth } from 'src/auth/decorators/api-key-swagger.decorator'
import { UserSession } from 'src/auth/types/session'
import { CurrentUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { User } from './types/user'

@Controller('users')
@ApiTags('users')
@ApiKeyAuth()
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@CurrentUser() user: UserSession): Promise<User> {
    const profile = await this.usersService.user({ id: user.id })

    return profile
  }
}
