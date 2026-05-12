import { ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';

/** Single source of truth for HTTP DTO validation (used in `main.ts`). */
export const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
};

export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe(validationPipeOptions);
}
