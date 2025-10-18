import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { v4 } from 'uuid';
import { Escrow, EscrowStatus } from '../entities/escrow.entity';
import { User, UserRole, KYCStatus } from '../entities/user.entity';
import { Milestone, MilestoneStatus } from '../entities/milestone.entity';
import { Transaction, TransactionType, TransactionStatus } from '../entities/transaction.entity';
import { EscrowCreateDto, FundEscrowDto } from '../dto/escrow.dto';

function mockBlockTx() {
  return '0x' + v4().replace(/-/g, '').slice(0, 64);
}

function mockContractAddress() {
  return '0x' + v4().replace(/-/g, '').slice(0, 40);
}

@Injectable()
export class EscrowService {
  constructor(private readonly em: EntityManager) {}

  async createEscrow(userId: string, dto: EscrowCreateDto): Promise<Escrow> {
    // find or create counterparty by email
    let counterparty = await this.em.findOne(User, { email: dto.counterpartyEmail });
    const currentUser = await this.em.findOneOrFail(User, { id: userId });

    if (!counterparty) {
      counterparty = new User();
      counterparty.email = dto.counterpartyEmail;
      counterparty.displayName = dto.counterpartyEmail.split('@')[0];
      counterparty.role = currentUser.role === UserRole.CLIENT ? UserRole.FREELANCER : UserRole.CLIENT;
      counterparty.kycStatus = KYCStatus.PENDING;
      await this.em.persistAndFlush(counterparty);
    }

    const escrow = new Escrow();
    escrow.client = currentUser.role === 'client' ? currentUser : counterparty;
    escrow.freelancer = currentUser.role === 'client' ? counterparty : currentUser;
    escrow.token = dto.token || 'USDC';
    escrow.chain = dto.chain || 'Base';
    escrow.totalAmount = dto.totalAmount;
    escrow.fundedAmount = 0;
    escrow.releasedAmount = 0;
    escrow.status = EscrowStatus.PENDING;
    escrow.cancellable = dto.cancellable ?? true;
    escrow.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : undefined;
    escrow.contractAddress = mockContractAddress();

    // create milestones
    // create milestones
    for (const m of dto.milestones) {
      const mm = new Milestone();
      mm.amount = m.amount;
      mm.description = m.description;
      mm.dueDate = new Date(m.dueDate);
      mm.status = MilestoneStatus.PENDING;
      mm.deliverables = m.deliverables || [];
      mm.escrow = escrow;
      escrow.milestones.add(mm);
    }

    await this.em.persistAndFlush(escrow);
    return escrow;
  }

  async listEscrows(userId: string, status?: string): Promise<Escrow[]> {
    const qb = this.em.createQueryBuilder(Escrow);
    qb.where({ $or: [{ client: userId }, { freelancer: userId }] });
    if (status) qb.andWhere({ status });
    return qb.getResultList();
  }

  async getEscrow(userId: string, escrowId: string): Promise<Escrow> {
    const escrow = await this.em.findOne(Escrow, { id: escrowId });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.client.id !== userId && escrow.freelancer.id !== userId) throw new ForbiddenException('Access denied');
    return escrow;
  }

  async fundEscrow(userId: string, escrowId: string, dto: FundEscrowDto) {
    const escrow = await this.em.findOne(Escrow, { id: escrowId });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.client.id !== userId) throw new ForbiddenException('Only client can fund');

    const amount = dto.amount ?? escrow.totalAmount;
    escrow.fundedAmount = amount;
    escrow.status = EscrowStatus.FUNDED;
    await this.em.flush();

    const tx = new Transaction();
    tx.escrowId = escrow.id;
    tx.txHash = mockBlockTx();
    tx.type = TransactionType.FUND;
    tx.amount = amount;
    tx.token = escrow.token;
    tx.chain = escrow.chain;
    tx.status = TransactionStatus.CONFIRMED;
    await this.em.persistAndFlush(tx);

    return { success: true, txHash: tx.txHash };
  }

  async approveMilestone(userId: string, escrowId: string, milestoneId: string) {
    const escrow = await this.em.findOne(Escrow, { id: escrowId });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.client.id !== userId) throw new ForbiddenException('Only client can approve');

  const milestone = escrow.milestones.getItems().find((m: Milestone) => m.id === milestoneId) as Milestone | undefined;
    if (!milestone) throw new NotFoundException('Milestone not found');
  milestone.status = MilestoneStatus.APPROVED;
    await this.em.flush();
    return { success: true, message: 'Milestone approved' };
  }

  async releaseFunds(userId: string, escrowId: string, milestoneId: string) {
    const escrow = await this.em.findOne(Escrow, { id: escrowId });
    if (!escrow) throw new NotFoundException('Escrow not found');
    if (escrow.client.id !== userId) throw new ForbiddenException('Only client can release');

    const milestone = escrow.milestones.getItems().find((m: Milestone) => m.id === milestoneId) as Milestone | undefined;
    if (!milestone) throw new NotFoundException('Milestone not found');

  milestone.status = MilestoneStatus.RELEASED;
    escrow.releasedAmount = (escrow.releasedAmount || 0) + milestone.amount;
    await this.em.flush();

    const tx = new Transaction();
    tx.escrowId = escrow.id;
    tx.txHash = mockBlockTx();
    tx.type = TransactionType.RELEASE;
    tx.amount = milestone.amount;
    tx.token = escrow.token;
    tx.chain = escrow.chain;
    tx.status = TransactionStatus.CONFIRMED;
    await this.em.persistAndFlush(tx);

    return { success: true, txHash: tx.txHash };
  }
}
