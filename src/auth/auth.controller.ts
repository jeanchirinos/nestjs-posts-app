import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { ApiSecurity, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'
import { Public } from './decorators/auth.decorator'
import { LoginDto } from './dtos/login.dto'
import { SignUpDto } from './dtos/signup.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { UserSession } from './types/session'

@ApiTags('auth')
@ApiSecurity('x-api-key')
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
  async login(@Body() data: LoginDto, @CurrentUser() user: UserSession) {
    const loginData = await this.authService.login(user)

    return {
      message: 'Login successful',
      ...loginData,
    }
  }

  @ApiSecurity('bearer')
  @Get('session')
  async session(@CurrentUser() user: UserSession) {
    return this.authService.session(user.id)
  }
}
