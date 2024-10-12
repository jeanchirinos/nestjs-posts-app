import { Module, NestModule } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { PostModule } from './posts/posts.module'
import { ResponseInterceptor } from './response.interceptor'
import { UsersModule } from './users/users.module'

@Module({
  imports: [UsersModule, PostModule, AuthModule],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
