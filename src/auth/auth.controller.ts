import { BadRequestException, Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'
import { ApiKeyAuth } from './decorators/api-key-swagger.decorator'
import { Public } from './decorators/auth.decorator'
import { LoginDto } from './dtos/login.dto'
import { SignUpDto } from './dtos/signup.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { UserSession } from './types/session'

@ApiTags('auth')
@ApiKeyAuth()
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
  @HttpCode(200)
  @ApiBody({
    type: LoginDto,
  })
  async login(@CurrentUser() user: UserSession) {
    const loginData = await this.authService.login(user)

    return {
      message: 'Login successful',
      ...loginData,
    }
  }

  @ApiBearerAuth()
  @Get('session')
  async session(@CurrentUser() user: UserSession): Promise<UserSession> {
    return this.authService.session(user.id)
  }
}
