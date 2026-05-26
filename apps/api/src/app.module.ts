import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { AnalyticsModule } from './analytics/analytics.module';
import { FinanceModule } from './finance/finance.module';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { QueuesModule } from './queues/queues.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        if (process.env.E2E_TEST === 'true') {
          return {
            type: 'better-sqlite3',
            database: ':memory:',
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
          };
        }
        return {
          type: 'postgres',
          host: config.get<string>('database.host'),
          port: config.get<number>('database.port'),
          username: config.get<string>('database.user'),
          password: config.get<string>('database.password'),
          database: config.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: config.get<string>('nodeEnv') !== 'production',
          logging: config.get<string>('nodeEnv') === 'development',
        };
      },
    }),
    RedisModule,
    QueuesModule,
    EmailModule,
    NotificationsModule,
    HealthModule,
    OrganizationsModule,
    FinanceModule,
    LeadsModule,
    UsersModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
