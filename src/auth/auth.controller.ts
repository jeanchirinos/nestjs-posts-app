import { BadRequestException, Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { CurrentUser } from 'src/users/decorators/users.decorator'
import { UsersService } from 'src/users/users.service'
import { AuthService } from './auth.service'
// import { ApiKeyAuth } from './decorators/api-key-swagger.decorator'
import { Public } from './decorators/auth.decorator'
import { LoginDto } from './dtos/login.dto'
import { SignUpDto } from './dtos/signup.dto'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { UserSession } from './types/session'
import { ResponseMessage } from 'src/response-message.decorator'
import { Response } from 'express'
import { COOKIE_JWT_TOKEN } from 'src/constants'
import { setAccessTokenInCookies } from './utils/setAccessTokenInCookies'

@Controller('auth')
@ApiTags('auth')
// @ApiKeyAuth()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Public()
  @Post('signup')
  @ResponseMessage('User created successfully')
  @ApiOperation({ summary: 'Create a new user' })
  async signupUser(
    @Body() data: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    access_token: string
    user: UserSession
  }> {
    try {
      const newUser = await this.usersService.createUser(data)
      const loggedUser = await this.authService.login(newUser)

      setAccessTokenInCookies(res, loggedUser.access_token)

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
  @ResponseMessage('Login successful')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        value: {
          email: 'example@gmail.com',
          password: '123456',
        },
      },
    },
  })
  async login(
    @CurrentUser() user: UserSession,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    access_token: string
    user: UserSession
  }> {
    const loginData = await this.authService.login(user)

    setAccessTokenInCookies(res, loginData.access_token)

    return loginData
  }

  @Get('session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user session' })
  async session(@CurrentUser() user: UserSession): Promise<UserSession> {
    return this.authService.session(user.id)
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout user' })
  @ResponseMessage('Logout successful')
  async logout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie(COOKIE_JWT_TOKEN)
  }
}
