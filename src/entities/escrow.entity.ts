import { Entity, Property, Enum, ManyToOne, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Milestone } from './milestone.entity';
import { Dispute } from './dispute.entity';

export enum EscrowStatus {
  PENDING = 'pending',
  FUNDED = 'funded',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Escrow extends BaseEntity {
  @ManyToOne(() => User)
  client!: User;

  @ManyToOne(() => User)
  freelancer!: User;

  @Property()
  token!: string;

  @Property()
  chain!: string;

  @Property()
  totalAmount!: number;

  @Property({ default: 0 })
  fundedAmount: number = 0;

  @Property({ default: 0 })
  releasedAmount: number = 0;

  @OneToMany(() => Milestone, milestone => milestone.escrow)
  milestones = new Collection<Milestone>(this);

  @Enum(() => EscrowStatus)
  status: EscrowStatus = EscrowStatus.PENDING;

  @Property()
  cancellable: boolean = true;

  @Property({ nullable: true })
  expiryDate?: Date;

  @Property({ nullable: true })
  contractAddress?: string;

  @OneToMany(() => Dispute, dispute => dispute.escrow)
  disputes = new Collection<Dispute>(this);
}