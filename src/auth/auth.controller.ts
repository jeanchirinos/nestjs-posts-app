import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'
import { Public } from './decorators/auth.decorator'
import { SignUpDto } from './dtos/signup.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { ApiTags } from '@nestjs/swagger'
import { UserSession } from './types/session'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('signup')
  async signupUser(@Body() data: SignUpDto) {
    try {
      const newUser = await this.usersService.createUser(data)
      const loggedUser = await this.authService.login(newUser)

      return loggedUser
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new BadRequestException('Email already exists')
        }
      }
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: UserSession) {
    return this.authService.login(user)
  }

  @Get('session')
  async session(@CurrentUser() user: UserSession) {
    return this.authService.session(user.id)
  }
}
