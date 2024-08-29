import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { Public } from './auth.decorator';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly usersService: UserService,
  ) {}

  @Public()
  @Post('/signup')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<Omit<UserModel, 'password'>> {
    try {
      return await this.usersService.createUser(userData);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            {
              message: 'Email already exists',
            },
            400,
          );
        }
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() signInDto: Record<string, any>) {
    try {
      return await this.authService.signIn(signInDto.email, signInDto.password);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new HttpException(
            {
              message: 'Email already exists',
            },
            400,
          );
        }
      } else if (e instanceof UnauthorizedException) {
        throw new HttpException(
          {
            message: 'Invalid credentials',
          },
          401,
        );
      }
    }
  }
}
