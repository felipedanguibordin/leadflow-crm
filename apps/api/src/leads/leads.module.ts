import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DelinquencyContextMiddleware } from '../finance/delinquency-context.middleware';
import { FinanceModule } from '../finance/finance.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { QueuesModule } from '../queues/queues.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Lead } from './entities/lead.entity';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    OrganizationsModule,
    FinanceModule,
    QueuesModule,
    NotificationsModule,
  ],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(DelinquencyContextMiddleware).forRoutes(LeadsController);
  }
}
