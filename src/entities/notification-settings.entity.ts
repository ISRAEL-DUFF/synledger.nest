import { Entity, Property, OneToOne } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity()
export class NotificationSettings extends BaseEntity {
  @OneToOne(() => User)
  user!: User;

  @Property()
  emailEnabled: boolean = true;

  @Property()
  webhookEnabled: boolean = false;

  @Property({ nullable: true })
  slackWebhook?: string;

  @Property({ nullable: true })
  discordWebhook?: string;
}