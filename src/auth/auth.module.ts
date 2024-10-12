import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
// import { PassportModule } from '@nestjs/passport'
import { UsersModule } from 'src/users/users.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { APP_GUARD } from '@nestjs/core'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { ApiKeyStrategy } from './strategies/api-key.strategy'

@Module({
  imports: [
    UsersModule,
    // PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    ApiKeyStrategy,
  ],
})
export class AuthModule {}
