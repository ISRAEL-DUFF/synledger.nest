import { Controller, Post, Body, UseGuards, Request, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { EscrowService } from '../services/escrow.service';
import { EscrowCreateDto, FundEscrowDto } from '../dto/escrow.dto';

@ApiTags('Escrows')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('escrows')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  @ApiOperation({ summary: 'Create an escrow' })
  async create(@Request() req: any, @Body() dto: EscrowCreateDto) {
    return this.escrowService.createEscrow(req.user.id, dto);
  }

  @Get()
  async list(@Request() req: any, @Query('status') status?: string) {
    return this.escrowService.listEscrows(req.user.id, status);
  }

  @Get(':id')
  async get(@Request() req: any, @Param('id') id: string) {
    return this.escrowService.getEscrow(req.user.id, id);
  }

  @Post(':id/fund')
  async fund(@Request() req: any, @Param('id') id: string, @Body() dto: FundEscrowDto) {
    return this.escrowService.fundEscrow(req.user.id, id, dto);
  }

  @Post(':id/milestones/:mid/approve')
  async approve(@Request() req: any, @Param('id') id: string, @Param('mid') mid: string) {
    return this.escrowService.approveMilestone(req.user.id, id, mid);
  }

  @Post(':id/milestones/:mid/release')
  async release(@Request() req: any, @Param('id') id: string, @Param('mid') mid: string) {
    return this.escrowService.releaseFunds(req.user.id, id, mid);
  }
}
