import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = Symbol('REDIS_CLIENT');

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('redis.url') ?? 'redis://localhost:6379';
        return new Redis(url, { maxRetriesPerRequest: 3, lazyConnect: true });
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
