import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User as UserModel, Prisma } from '@prisma/client';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UserService) {}

  @Post('/signup')
  async signupUser(
    @Body() userData: { name?: string; email: string },
  ): Promise<UserModel> {
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
}
