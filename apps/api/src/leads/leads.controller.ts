import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DelinquencyGuard } from '../finance/delinquency.guard';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@Controller('organizations/:organizationId/leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  @ApiOperation({
    summary: 'List leads (reads stay available even when financially blocked)',
  })
  list(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.leads.list(organizationId);
  }

  @Post()
  @UseGuards(DelinquencyGuard)
  @ApiOperation({
    summary: 'Create lead — blocked when organization has pending boletos',
  })
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreateLeadDto,
  ) {
    return this.leads.create(organizationId, dto);
  }

  @Patch(':id')
  @UseGuards(DelinquencyGuard)
  @ApiOperation({
    summary: 'Update lead — blocked when financially delinquent',
  })
  update(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.leads.update(organizationId, id, dto);
  }

  @Delete(':id')
  @UseGuards(DelinquencyGuard)
  @ApiOperation({
    summary: 'Delete lead — blocked when financially delinquent',
  })
  remove(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leads.remove(organizationId, id);
  }
}
