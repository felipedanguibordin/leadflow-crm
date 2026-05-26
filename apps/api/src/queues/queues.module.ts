import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailProcessor } from './processors/email.processor';
import { NotificationProcessor } from './processors/notification.processor';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'emails' },
      { name: 'notifications' },
      { name: 'webhooks' },
    ),
  ],
  providers: [EmailProcessor, NotificationProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
