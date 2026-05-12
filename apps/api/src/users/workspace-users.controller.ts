import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateWorkspaceUserDto } from './dto/create-workspace-user.dto';
import { WorkspaceUsersService } from './workspace-users.service';

@ApiTags('Workspace users')
@Controller('organizations/:organizationId/workspace-users')
export class WorkspaceUsersController {
  constructor(private readonly users: WorkspaceUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users for KPI “active users”' })
  list(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.users.list(organizationId);
  }

  @Post()
  @ApiOperation({ summary: 'Register a collaborator under the tenant' })
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreateWorkspaceUserDto,
  ) {
    return this.users.create(organizationId, dto);
  }

  @Post(':userId/ping')
  @ApiOperation({
    summary: 'Simulate activity (updates lastActiveAt for dashboard)',
  })
  ping(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.users.ping(organizationId, userId);
  }
}
