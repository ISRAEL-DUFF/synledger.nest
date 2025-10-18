import { Controller, Get, Put, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { NotificationSettings } from '../entities/notification-settings.entity';
import { Transaction } from '../entities/transaction.entity';
import { 
  UpdateProfileDto, 
  ConnectWalletDto, 
  UpdateNotificationSettingsDto,
  WalletBalanceResponse 
} from '../dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: User })
  async updateProfile(
    @Request() req: any,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.userService.updateProfile(req.user.id, dto);
  }

  @Post('connect-wallet')
  @ApiOperation({ summary: 'Connect wallet to user account' })
  @ApiResponse({ status: 200, description: 'Wallet connected successfully', type: User })
  async connectWallet(
    @Request() req: any,
    @Body() dto: ConnectWalletDto,
  ): Promise<User> {
    return this.userService.connectWallet(req.user.id, dto);
  }

  @Get('notification-settings')
  @ApiOperation({ summary: 'Get user notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings retrieved', type: NotificationSettings })
  async getNotificationSettings(@Request() req: any): Promise<NotificationSettings> {
    return this.userService.getNotificationSettings(req.user.id);
  }

  @Put('notification-settings')
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Notification settings updated', type: NotificationSettings })
  async updateNotificationSettings(
    @Request() req: any,
    @Body() dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettings> {
    return this.userService.updateNotificationSettings(req.user.id, dto);
  }

  @Get('wallet/balance')
  @ApiOperation({ summary: 'Get user wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance retrieved', type: WalletBalanceResponse })
  async getWalletBalance(@Request() req: any): Promise<WalletBalanceResponse> {
    return this.userService.getWalletBalance(req.user.id);
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'Get user transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved', type: [Transaction] })
  async getTransactions(@Request() req: any): Promise<Transaction[]> {
    return this.userService.getTransactions(req.user.id);
  }
}