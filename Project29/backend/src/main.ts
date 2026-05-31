import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const seedService = app.get(SeedService);
  await seedService.seed();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Heritage NFT Platform Backend is running on port ${port}`);
}

bootstrap();
