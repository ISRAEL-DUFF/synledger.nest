import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../entities/user.entity';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Transaction } from '../entities/transaction.entity';
import { Escrow } from '../entities/escrow.entity';
import { UpdateProfileDto, ConnectWalletDto, UpdateNotificationSettingsDto } from '../dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly em: EntityManager,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.displayName !== undefined) {
      user.displayName = dto.displayName;
    }
    if (dto.notificationsEnabled !== undefined) {
      user.notificationsEnabled = dto.notificationsEnabled;
    }

    await this.em.flush();
    return user;
  }

  async connectWallet(userId: string, dto: ConnectWalletDto): Promise<User> {
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.walletAddress = dto.walletAddress.toLowerCase();
    user.ensName = dto.ensName;

    await this.em.flush();
    return user;
  }

  async getNotificationSettings(userId: string): Promise<NotificationSettings> {
    let settings = await this.em.findOne(NotificationSettings, { user: userId });
    if (!settings) {
      const foundUser = await this.em.findOneOrFail(User, { id: userId });
      settings = new NotificationSettings();
      settings.user = foundUser;
      settings.emailEnabled = true;
      settings.webhookEnabled = false;
      await this.em.persistAndFlush(settings);
    }
    return settings;
  }

  async updateNotificationSettings(userId: string, dto: UpdateNotificationSettingsDto): Promise<NotificationSettings> {
    let settings = await this.em.findOne(NotificationSettings, { user: userId });
    const user = await this.em.findOneOrFail(User, { id: userId });

    if (!settings) {
      settings = new NotificationSettings();
      settings.user = user;
      settings.emailEnabled = dto.emailEnabled;
      settings.webhookEnabled = dto.webhookEnabled;
      settings.slackWebhook = dto.slackWebhook;
      settings.discordWebhook = dto.discordWebhook;
      await this.em.persistAndFlush(settings);
    } else {
      this.em.assign(settings, dto);
      await this.em.flush();
    }

    return settings;
  }

  async getWalletBalance(userId: string) {
    const escrows = await this.em.find(Escrow, {
      $or: [
        { client: userId },
        { freelancer: userId },
      ],
    });

    const totalEscrowed = escrows.reduce((sum, e) => 
      e.status === 'funded' || e.status === 'active' ? sum + e.fundedAmount : sum, 0);

    const totalReleased = escrows.reduce((sum, e) => sum + e.releasedAmount, 0);

    // In a real application, you would integrate with blockchain RPC here
    return {
      available: 10000.00,
      escrowed: totalEscrowed,
      released: totalReleased,
      chains: [
        { chain: 'Base', token: 'USDC', balance: 5000.00 },
        { chain: 'Polygon', token: 'USDT', balance: 5000.00 },
      ],
    };
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const escrows = await this.em.find(Escrow, {
      $or: [
        { client: userId },
        { freelancer: userId },
      ],
    });

    const escrowIds = escrows.map(e => e.id);
    return this.em.find(Transaction, { escrowId: { $in: escrowIds } });
  }
}