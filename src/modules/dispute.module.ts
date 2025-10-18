import { Module } from '@nestjs/common';
import { DisputeService } from '../services/dispute.service';
import { DisputeController } from '../controllers/dispute.controller';

@Module({
  controllers: [DisputeController],
  providers: [DisputeService],
  exports: [DisputeService],
})
export class DisputeModule {}