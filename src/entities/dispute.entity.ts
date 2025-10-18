import { Entity, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Escrow } from './escrow.entity';

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
}

export enum DisputeSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Entity()
export class Dispute extends BaseEntity {
  @ManyToOne(() => Escrow)
  escrow!: Escrow;

  @Property()
  milestoneId!: string;

  @ManyToOne(() => User)
  raisedBy!: User;

  @Property()
  reason!: string;

  @Property({ type: 'array' })
  evidence: string[] = [];

  @Enum(() => DisputeStatus)
  status: DisputeStatus = DisputeStatus.OPEN;

  @Enum(() => DisputeSeverity)
  severity: DisputeSeverity = DisputeSeverity.MEDIUM;

  @Property({ nullable: true })
  resolutionNotes?: string;
}