import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, SIWEVerifyDto } from '../dto/auth.dto';
import { User } from '../entities/user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: User })
  async register(@Body() dto: RegisterDto): Promise<{ accessToken: string; user: User }> {
    console.log(dto);
    const user = await this.authService.register(dto);
    const { accessToken } = await this.authService.login({ email: dto.email, password: dto.password });
    return { accessToken, user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully logged in', type: User })
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string; user: User }> {
      console.log(dto);
    return this.authService.login(dto);
  }

  @Post('siwe/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify SIWE signature and login' })
  @ApiResponse({ status: 200, description: 'SIWE verification successful', type: User })
  async verifyWallet(@Body() dto: SIWEVerifyDto): Promise<{ accessToken: string; user: User }> {
    console.log(dto);
    return this.authService.verifyWallet(dto);
  }
}