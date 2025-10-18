import { Module } from '@nestjs/common';
import { EscrowService } from '../services/escrow.service';
import { EscrowController } from '../controllers/escrow.controller';

@Module({
  controllers: [EscrowController],
  providers: [EscrowService],
  exports: [EscrowService],
})
export class EscrowModule {}