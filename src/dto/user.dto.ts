import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  displayName?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
}

export class ConnectWalletDto {
  @ApiProperty()
  @IsString()
  walletAddress!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  ensName?: string;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty()
  @IsBoolean()
  emailEnabled!: boolean;

  @ApiProperty()
  @IsBoolean()
  webhookEnabled!: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  slackWebhook?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  discordWebhook?: string;
}

export class WalletBalanceResponse {
  @ApiProperty()
  available: number;

  @ApiProperty()
  escrowed: number;

  @ApiProperty()
  released: number;

  @ApiProperty({ type: [Object] })
  chains: Array<{
    chain: string;
    token: string;
    balance: number;
  }>;
}