import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsModule } from '../organizations/organizations.module';
import { WorkspaceUser } from './entities/workspace-user.entity';
import { WorkspaceUsersController } from './workspace-users.controller';
import { WorkspaceUsersService } from './workspace-users.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceUser]), OrganizationsModule],
  controllers: [WorkspaceUsersController],
  providers: [WorkspaceUsersService],
  exports: [TypeOrmModule],
})
export class UsersModule {}
