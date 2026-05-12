import { createGlobalValidationPipe } from './common/validation/validation-pipe.options';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createGlobalValidationPipe());

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? [
      'http://localhost:4200',
    ],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LeadFlow CRM API')
    .setDescription(
      'REST API for LeadFlow — distributor lead management, RBAC, and enterprise workflows.',
    )
    .setVersion('0.1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('Health', 'Service and dependency health')
    .addTag('Organizations', 'Tenant / distributor directory')
    .addTag('Finance', 'Boletos, invoices, settlement')
    .addTag('Leads', 'Lead pipeline (writes guarded by financial compliance)')
    .addTag('Workspace users', 'Collaborators & activity for KPIs')
    .addTag('Analytics', 'Dashboard metrics')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

void bootstrap();
