import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}
  async signIn(
    email: string,
    password: string,
    // res: Response,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.user({ email });

    if (user?.password !== password) {
      throw new UnauthorizedException();
    }

    // const { password, ...result } = user;
    // TODO: Generate a JWT and return it here

    // const payload = { sub: user.userId, username: user.username };
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    });

    // set this token in the response header
    // instead of the body and after that return the response

    // res.setHeader('Authorization', `Bearer ${accessToken}`);
    // res.cookie('access_token', accessToken, {
    //   expires: new Date(Date.now() + 900000),
    //   httpOnly: true,
    // });

    // res.send({ access_token: accessToken });

    return {
      access_token: accessToken,
    };
  }
}
