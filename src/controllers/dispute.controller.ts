import { Controller, Post, Body, UseGuards, Request, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { DisputeService } from '../services/dispute.service';

class CreateDisputeDto {
  escrowId!: string;
  milestoneId!: string;
  reason!: string;
  evidence?: string[];
}

@ApiTags('Disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateDisputeDto) {
    return this.disputeService.createDispute(req.user.id, dto.escrowId, dto.milestoneId, dto.reason, dto.evidence || []);
  }

  @Get()
  async list(@Request() req: any, @Query('status') status?: string) {
    return this.disputeService.listDisputes(req.user.id, status);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.disputeService.getDispute(id);
  }

  @Post(':id/resolve')
  async resolve(@Param('id') id: string, @Body() body: any) {
    return this.disputeService.resolveDispute(id, body.resolutionNotes || '');
  }
}
