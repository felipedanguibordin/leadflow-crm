import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePayableDto } from './dto/create-payable.dto';
import { PayablesService } from './payables.service';

@ApiTags('Finance')
@Controller('organizations/:organizationId/payables')
export class PayablesController {
  constructor(private readonly payables: PayablesService) {}

  @Get()
  @ApiOperation({ summary: 'List financial documents for an organization' })
  list(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.payables.listByOrganization(organizationId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Register a new boleto/invoice (typically from billing integration)',
  })
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreatePayableDto,
  ) {
    return this.payables.create(organizationId, dto);
  }

  @Post(':payableId/settle')
  @ApiOperation({
    summary: 'Mark document as paid (treasury / bank confirmation)',
  })
  settle(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('payableId', ParseUUIDPipe) payableId: string,
  ) {
    return this.payables.settlePaid(organizationId, payableId);
  }
}
