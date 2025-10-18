import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { Escrow } from './entities/escrow.entity';
import { Milestone } from './entities/milestone.entity';
import { Dispute } from './entities/dispute.entity';
import { Webhook } from './entities/webhook.entity';
import { Transaction } from './entities/transaction.entity';
import { NotificationSettings } from './entities/notification-settings.entity';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';
import { EscrowModule } from './modules/escrow.module';
import { DisputeModule } from './modules/dispute.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MikroOrmModule.forRoot(),
    MikroOrmModule.forFeature([
      User,
      Escrow,
      Milestone,
      Dispute,
      Webhook,
      Transaction,
      NotificationSettings,
    ]),
  AuthModule,
  UserModule,
  EscrowModule,
  DisputeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
