import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}

  @Get()
  @ApiOperation({ summary: 'List organizations (tenant directory)' })
  list() {
    return this.organizations.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by id' })
  getOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizations.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() dto: CreateOrganizationDto) {
    return this.organizations.create(dto);
  }
}
