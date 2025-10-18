import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty()
  @IsString()
  displayName!: string;

  @ApiProperty({ enum: UserRole, default: UserRole.FREELANCER })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.FREELANCER;
}

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class SIWEVerifyDto {
  @ApiProperty()
  @IsString()
  message!: string;

  @ApiProperty()
  @IsString()
  signature!: string;

  @ApiProperty()
  @IsString()
  address!: string;
}