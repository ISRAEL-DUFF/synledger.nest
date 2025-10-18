import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import * as bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import { User, UserRole, KYCStatus } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/auth.interface';
import { RegisterDto, LoginDto, SIWEVerifyDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const exists = await this.em.findOne(User, { email: dto.email });
    if (exists) {
      throw new UnauthorizedException('Email already registered');
    }

    const user = new User();
    user.email = dto.email;
    user.displayName = dto.displayName;
    user.role = dto.role || UserRole.FREELANCER;
    user.passwordHash = await this.hashPassword(dto.password);
    user.kycStatus = KYCStatus.PENDING;
    user.notificationsEnabled = true;
    user.twoFaEnabled = false;

    await this.em.persistAndFlush(user);
    return user;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: User }> {
    const user = await this.em.findOne(User, { email: dto.email });
    if (!user || !user.passwordHash || !await this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  async verifyWallet(dto: SIWEVerifyDto): Promise<{ accessToken: string; user: User }> {
    // In production, verify the SIWE message and signature here
    const address = dto.address.toLowerCase();

    let user = await this.em.findOne(User, { walletAddress: address });
    if (!user) {
      user = new User();
      user.email = `${address.slice(0, 8)}@wallet.synledger`;
      user.displayName = `User ${address.slice(0, 6)}`;
      user.role = UserRole.FREELANCER;
      user.walletAddress = address;
      user.kycStatus = KYCStatus.PENDING;
      user.notificationsEnabled = true;
      user.twoFaEnabled = false;

      await this.em.persistAndFlush(user);
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}