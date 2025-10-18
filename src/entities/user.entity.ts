import { Entity, Property, Enum, Collection, OneToMany } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { Escrow } from './escrow.entity';
import { Dispute } from './dispute.entity';
import { Webhook } from './webhook.entity';

export enum UserRole {
  CLIENT = 'client',
  FREELANCER = 'freelancer',
  MARKETPLACE = 'marketplace',
}

export enum KYCStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
export class User extends BaseEntity {
  @Property({ unique: true })
  email!: string;

  @Property()
  displayName!: string;

  @Property({ hidden: true, nullable: true })
  passwordHash?: string;

  @Enum(() => UserRole)
  role: UserRole = UserRole.FREELANCER;

  @Property({ nullable: true })
  walletAddress?: string;

  @Property({ nullable: true })
  ensName?: string;

  @Enum(() => KYCStatus)
  kycStatus: KYCStatus = KYCStatus.PENDING;

  @Property()
  notificationsEnabled: boolean = true;

  @Property()
  twoFaEnabled: boolean = false;

  @OneToMany(() => Escrow, escrow => escrow.client)
  clientEscrows = new Collection<Escrow>(this);

  @OneToMany(() => Escrow, escrow => escrow.freelancer)
  freelancerEscrows = new Collection<Escrow>(this);

  @OneToMany(() => Dispute, dispute => dispute.raisedBy)
  disputes = new Collection<Dispute>(this);

  @OneToMany(() => Webhook, webhook => webhook.user)
  webhooks = new Collection<Webhook>(this);
}