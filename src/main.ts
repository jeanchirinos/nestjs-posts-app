import { ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppModule } from './app.module'
// import { apiKeyMiddleware } from './auth/middlewares/auth.middleware'
// import { API_KEY_HEADER } from './constants'
import { throwValidationException } from './utils/getValidationException'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // app.use(apiKeyMiddleware)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory(errors) {
        throwValidationException(errors)
      },
    }),
  )

  app.use(cookieParser())
  app.enableCors()

  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.setGlobalPrefix('v1/api')

  // if (process.env.NODE_ENV === 'development') {
  const config = new DocumentBuilder()
    .setTitle('NestJs - Posts API')
    .setDescription('API for managing posts')
    .setVersion('1.0')
    .setContact('Jean Chirinos', 'https://jeanchirinos.vercel.app', 'jeanchirinos17@gmail.com')
    // .addApiKey({ type: 'apiKey', name: API_KEY_HEADER, in: 'header' }, API_KEY_HEADER)
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', description: 'This is optional if you prefer setting it by using login route' },
      'bearer',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('api-docs', app, document)
  // }

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
