import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import emailRouter from './email/email.routes';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase body size limit for Base64 image uploads
  // Allow up to 100MB for JSON (to handle 10 images × 5MB each = ~67MB after Base64 encoding)
  // IMPORTANT: Exclude multipart routes (uploads) to avoid conflicts with multer
  app.use((req, res, next) => {
    // Skip body parsing for multipart/form-data (file uploads)
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }
    json({ limit: '100mb' })(req, res, next);
  });
  
  app.use((req, res, next) => {
    // Skip body parsing for multipart/form-data (file uploads)
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      return next();
    }
    urlencoded({ limit: '100mb', extended: true })(req, res, next);
  });
  
  // Configuration CORS pour le développement et la production
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean); // Enlever les valeurs undefined

  app.enableCors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origine (comme les appels d'API mobile ou serveur à serveur)
      if (!origin) return callback(null, true);
      
      // Vérifier si l'origine est dans la liste autorisée
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Pour les domaines Vercel, vérifier que c'est notre projet spécifique
      // Pattern: https://<project-name>-*.vercel.app ou https://<project-name>.vercel.app
      const vercelProjectName = process.env.VERCEL_PROJECT_NAME || 'gestion-apparts';
      try {
        const urlParts = new URL(origin);
        const hostname = urlParts.hostname;
        
        // Vérifier que le hostname se termine par .vercel.app (domaine exact)
        if (hostname.endsWith('.vercel.app') || hostname === `${vercelProjectName}.vercel.app`) {
          // Vérifier si le hostname correspond à notre projet Vercel
          if (hostname === `${vercelProjectName}.vercel.app` || 
              hostname.startsWith(`${vercelProjectName}-`) && hostname.endsWith('.vercel.app')) {
            return callback(null, true);
          }
        }
      } catch (error) {
        // Origine invalide (pas une URL valide)
        return callback(new Error('Invalid origin URL'));
      }
      
      // Origine non autorisée
      callback(new Error('Not allowed by CORS'));
    },
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