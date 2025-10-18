import { Entity, Property, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

export enum TransactionType {
  FUND = 'fund',
  RELEASE = 'release',
  REFUND = 'refund',
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity()
export class Transaction extends BaseEntity {
  @Property()
  escrowId!: string;

  @Property()
  txHash!: string;

  @Enum(() => TransactionType)
  type!: TransactionType;

  @Property()
  amount!: number;

  @Property()
  token!: string;

  @Property()
  chain!: string;

  @Enum(() => TransactionStatus)
  status: TransactionStatus = TransactionStatus.PENDING;
}