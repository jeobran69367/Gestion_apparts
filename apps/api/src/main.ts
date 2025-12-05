import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import emailRouter from './email/email.routes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS pour le développement et la production
  const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  // Global prefix
  app.setGlobalPrefix('api');


  // Fonction pour logger les routes (après l'initialisation)
  const logRoutes = () => {
    const server = app.getHttpServer();
    const request = server._events?.request;
    const router = request?._router;

    if (!router || !router.stack) {
      console.warn('Router or router stack is undefined. Unable to log routes.');
      return;
    }

    const availableRoutes: any[] = [];
    router.stack.forEach((layer: any) => {
      if (layer.route) {
        availableRoutes.push({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        });
      }
    });

    availableRoutes.forEach(route => {
    });
  };

  // Enregistrer les routes email
  app.use('/api', emailRouter);

  await app.listen(process.env.PORT ?? 4000);
  
  // Logger les routes une fois que l'application est prête
  logRoutes();
}

void bootstrap();