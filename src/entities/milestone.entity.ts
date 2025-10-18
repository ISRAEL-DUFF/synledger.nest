import { Entity, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Escrow } from './escrow.entity';

export enum MilestoneStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  RELEASED = 'released',
  DISPUTED = 'disputed',
}

@Entity()
export class Milestone extends BaseEntity {
  @Property()
  amount!: number;

  @Property()
  description!: string;

  @Property()
  dueDate!: Date;

  @Enum(() => MilestoneStatus)
  status: MilestoneStatus = MilestoneStatus.PENDING;

  @Property({ type: 'array' })
  deliverables: string[] = [];

  @ManyToOne(() => Escrow)
  escrow!: Escrow;
}