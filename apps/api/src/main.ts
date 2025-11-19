import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS pour le développement
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
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

    console.log('=== REGISTERED ROUTES ===');
    availableRoutes.forEach(route => {
      console.log(`${route.methods.join(', ').padEnd(8)} ${route.path}`);
    });
    console.log('=========================');
  };

  await app.listen(process.env.PORT ?? 4000);
  
  // Logger les routes une fois que l'application est prête
  logRoutes();
  
  console.log(
    `🚀 API running on: http://localhost:${process.env.PORT ?? 4000}/api`,
  );
}

void bootstrap();