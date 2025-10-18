import { Migration } from '@mikro-orm/migrations';

export class Migration20251017180239 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "transaction" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "escrow_id" varchar(255) not null, "tx_hash" varchar(255) not null, "type" text check ("type" in ('fund', 'release', 'refund')) not null, "amount" int not null, "token" varchar(255) not null, "chain" varchar(255) not null, "status" text check ("status" in ('pending', 'confirmed', 'failed')) not null default 'pending', constraint "transaction_pkey" primary key ("id"));`);

    this.addSql(`create table "user" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "email" varchar(255) not null, "display_name" varchar(255) not null, "password_hash" varchar(255) null, "role" text check ("role" in ('client', 'freelancer', 'marketplace')) not null default 'freelancer', "wallet_address" varchar(255) null, "ens_name" varchar(255) null, "kyc_status" text check ("kyc_status" in ('pending', 'approved', 'rejected')) not null default 'pending', "notifications_enabled" boolean not null default true, "two_fa_enabled" boolean not null default false, constraint "user_pkey" primary key ("id"));`);
    this.addSql(`alter table "user" add constraint "user_email_unique" unique ("email");`);

    this.addSql(`create table "notification_settings" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(255) not null, "email_enabled" boolean not null default true, "webhook_enabled" boolean not null default false, "slack_webhook" varchar(255) null, "discord_webhook" varchar(255) null, constraint "notification_settings_pkey" primary key ("id"));`);
    this.addSql(`alter table "notification_settings" add constraint "notification_settings_user_id_unique" unique ("user_id");`);

    this.addSql(`create table "escrow" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "client_id" varchar(255) not null, "freelancer_id" varchar(255) not null, "token" varchar(255) not null, "chain" varchar(255) not null, "total_amount" int not null, "funded_amount" int not null default 0, "released_amount" int not null default 0, "status" text check ("status" in ('pending', 'funded', 'active', 'completed', 'disputed', 'cancelled')) not null default 'pending', "cancellable" boolean not null default true, "expiry_date" timestamptz null, "contract_address" varchar(255) null, constraint "escrow_pkey" primary key ("id"));`);

    this.addSql(`create table "milestone" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "amount" int not null, "description" varchar(255) not null, "due_date" timestamptz not null, "status" text check ("status" in ('pending', 'approved', 'released', 'disputed')) not null default 'pending', "deliverables" text[] not null, "escrow_id" varchar(255) not null, constraint "milestone_pkey" primary key ("id"));`);

    this.addSql(`create table "dispute" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "escrow_id" varchar(255) not null, "milestone_id" varchar(255) not null, "raised_by_id" varchar(255) not null, "reason" varchar(255) not null, "evidence" text[] not null, "status" text check ("status" in ('open', 'under_review', 'resolved', 'escalated')) not null default 'open', "severity" text check ("severity" in ('low', 'medium', 'high')) not null default 'medium', "resolution_notes" varchar(255) null, constraint "dispute_pkey" primary key ("id"));`);

    this.addSql(`create table "webhook" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "user_id" varchar(255) not null, "endpoint" varchar(255) not null, "secret" varchar(255) not null, "events" text[] not null, "status" text check ("status" in ('active', 'inactive', 'failed')) not null default 'active', "last_attempt" timestamptz null, constraint "webhook_pkey" primary key ("id"));`);

    this.addSql(`alter table "notification_settings" add constraint "notification_settings_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "escrow" add constraint "escrow_client_id_foreign" foreign key ("client_id") references "user" ("id") on update cascade;`);
    this.addSql(`alter table "escrow" add constraint "escrow_freelancer_id_foreign" foreign key ("freelancer_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "milestone" add constraint "milestone_escrow_id_foreign" foreign key ("escrow_id") references "escrow" ("id") on update cascade;`);

    this.addSql(`alter table "dispute" add constraint "dispute_escrow_id_foreign" foreign key ("escrow_id") references "escrow" ("id") on update cascade;`);
    this.addSql(`alter table "dispute" add constraint "dispute_raised_by_id_foreign" foreign key ("raised_by_id") references "user" ("id") on update cascade;`);

    this.addSql(`alter table "webhook" add constraint "webhook_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;`);
  }

}
