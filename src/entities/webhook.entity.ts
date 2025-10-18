import { Entity, Property, ManyToOne, Enum } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
}

@Entity()
export class Webhook extends BaseEntity {
  @ManyToOne(() => User)
  user!: User;

  @Property()
  endpoint!: string;

  @Property()
  secret!: string;

  @Property({ type: 'array' })
  events: string[] = [];

  @Enum(() => WebhookStatus)
  status: WebhookStatus = WebhookStatus.ACTIVE;

  @Property({ nullable: true })
  lastAttempt?: Date;
}