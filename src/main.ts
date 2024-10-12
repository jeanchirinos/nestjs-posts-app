import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { apiKeyMiddleware } from './auth/middlewares/auth.middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      // disableErrorMessages: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Nest js - Simple crud')
    .setDescription('A simple crud application using nest js')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, document)

  app.enableCors()
  app.setGlobalPrefix('v1/api')
  app.use(apiKeyMiddleware)

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
