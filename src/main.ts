import { ValidationPipe } from '@nestjs/common'
import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AllExceptionsFilter } from './all-exceptions.filter'
import { AppModule } from './app.module'
import { apiKeyMiddleware } from './auth/middlewares/auth.middleware'
import { API_KEY_HEADER } from './constants'
import { throwValidationException } from './utils/getValidationException'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory(errors) {
        throwValidationException(errors)
      },
    }),
  )

  const { httpAdapter } = app.get(HttpAdapterHost)

  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  app.setGlobalPrefix('v1/api')

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Nest js - Simple crud')
      .setDescription('A simple crud application using nest js')
      .setVersion('1.0')
      .addApiKey({ type: 'apiKey', name: API_KEY_HEADER, in: 'header' }, API_KEY_HEADER)
      .addBearerAuth({ type: 'http', scheme: 'bearer' }, 'bearer')
      .build()

    app.enableCors()

    const document = SwaggerModule.createDocument(app, config)

    SwaggerModule.setup('api-docs', app, document)
  }

  app.use(apiKeyMiddleware)

  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
