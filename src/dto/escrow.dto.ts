import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MilestoneDto {
  @ApiProperty()
  @IsNumber()
  amount!: number;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsString()
  dueDate!: string;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  deliverables?: string[];
}

export class EscrowCreateDto {
  @ApiProperty()
  @IsString()
  counterpartyEmail!: string;

  @ApiProperty({ default: 'USDC' })
  @IsString()
  token!: string;

  @ApiProperty({ default: 'Base' })
  @IsString()
  chain!: string;

  @ApiProperty()
  @IsNumber()
  totalAmount!: number;

  @ApiProperty({ type: [MilestoneDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MilestoneDto)
  milestones!: MilestoneDto[];

  @ApiProperty({ default: true })
  @IsBoolean()
  @IsOptional()
  cancellable?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  expiryDate?: string;
}

export class FundEscrowDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  amount?: number;
}
