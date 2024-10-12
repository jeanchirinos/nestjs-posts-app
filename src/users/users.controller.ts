import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from './decorators/users.decorator'
import { UsersService } from './users.service'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user) {
    const profile = await this.usersService.user({ id: user.id })

    const { password, ...restData } = profile

    return { ...restData }
  }
}
