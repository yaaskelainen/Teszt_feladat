import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(process.cwd(), 'certs', 'server.key')),
    cert: fs.readFileSync(path.join(process.cwd(), 'certs', 'server.crt')),
  };

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions,
  });

  // Security headers with Helmet
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: [
      'https://localhost:3011',
      'https://localhost:3010',
      'http://localhost:3011',
      'http://localhost:3010',
      'http://localhost:3000',
      'https://localhost:3000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useBodyParser('json', { limit: '100kb' });
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend is running on HTTPS on port: ${port}`);
}
bootstrap();
