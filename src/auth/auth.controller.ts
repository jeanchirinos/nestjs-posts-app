import { Body, Controller, HttpException, Post, Request, UseGuards } from '@nestjs/common'
import { Prisma, User as UserModel } from '@prisma/client'
import { UserService } from 'src/user/user.service'
import { LocalAuthGuard } from './local-auth.guard'

@Controller()
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/signup')
  async signupUser(@Body() userData: { name?: string; email: string }): Promise<Omit<UserModel, 'password'>> {
    try {
      return await this.userService.createUser(userData)
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            {
              message: 'Email already exists',
            },
            400,
          )
        }
      }
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return req.user
  }
}
