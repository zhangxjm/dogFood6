import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getDatabase } from './database';
import { seedDatabase } from './seed';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  await getDatabase();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await seedDatabase();

  const staticPath = path.join(__dirname, '..', 'public');
  try {
    if (fs.existsSync(staticPath)) {
      const express = require('express');
      app.use(express.static(staticPath));
      console.log('[Server] Serving static files from', staticPath);
    }
  } catch (e) {
    console.log('[Server] No static files directory found');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`[Server] Application running on http://localhost:${port}`);
  console.log(`[Server] API available at http://localhost:${port}/api`);
}

bootstrap();
