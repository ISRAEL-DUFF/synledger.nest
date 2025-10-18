import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';
import { Dispute, DisputeStatus } from '../entities/dispute.entity';
import { Escrow } from '../entities/escrow.entity';

@Injectable()
export class DisputeService {
  constructor(private readonly em: EntityManager) {}

  async createDispute(raisedById: string, escrowId: string, milestoneId: string, reason: string, evidence: string[] = []) {
    const escrow = await this.em.findOne(Escrow, { id: escrowId });
    if (!escrow) throw new NotFoundException('Escrow not found');

    const dispute = new Dispute();
    dispute.escrow = escrow;
    dispute.milestoneId = milestoneId;
    dispute.raisedBy = await this.em.findOneOrFail('User', { id: raisedById } as any) as any;
    dispute.reason = reason;
    dispute.evidence = evidence || [];
    dispute.status = DisputeStatus.OPEN;
    dispute.severity = 'medium' as any;

    await this.em.persistAndFlush(dispute);
    escrow.status = 'disputed' as any;
    await this.em.flush();

    return dispute;
  }

  async listDisputes(userId: string, status?: string) {
    // find escrows for user
    const escrows = await this.em.find('Escrow', { $or: [{ client: userId }, { freelancer: userId }] } as any);
    const escrowIds = escrows.map((e: any) => e.id);
    const where: any = { escrow: { $in: escrowIds } };
    if (status) where.status = status;
    return this.em.find(Dispute, where);
  }

  async getDispute(disputeId: string) {
    return this.em.findOneOrFail(Dispute, { id: disputeId });
  }

  async resolveDispute(disputeId: string, resolutionNotes: string) {
    const dispute = await this.em.findOneOrFail(Dispute, { id: disputeId });
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolutionNotes = resolutionNotes;
    await this.em.flush();

    const escrow = await this.em.findOneOrFail(Escrow, { id: dispute.escrow.id });
    escrow.status = 'active' as any;
    await this.em.flush();

    return { success: true };
  }
}
