import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const documentBuilder = new DocumentBuilder()
    .setTitle('eduly test')
    .setDescription('a test for eduly backend position')
    .setVersion('1.0');
  if (process.env.NODE_ENV === 'production') {
    documentBuilder.addServer('/imdad');
  }
  const config = documentBuilder.build();
  const documentFactory = (): OpenAPIObject =>
    SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
