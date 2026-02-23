import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderItemDto } from './createOrders.dto';
import { EnumOrdersStatus, EnumPaymentsStatus } from 'src/utils/enums/enums';

export class UpdateOrderDto {
  @IsNotEmpty()
  @IsString()
  _id: string;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  total_amount: number;

  @IsString()
  address_id?: string; // Ref to address (microservice)

  @IsString()
  payment_id?: string;
  @IsOptional()
  @IsEnum(EnumOrdersStatus)
  status?: EnumOrdersStatus;

  @IsOptional()
  @IsEnum(EnumPaymentsStatus)
  payment_status?: EnumPaymentsStatus;
  // 🔹 Dates correspondantes aux statuts
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  pending_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  confirmed_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  processing_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  shipped_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  delivered_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cancelled_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  refunded_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  return_requested_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  returned_at?: Date;

  // 🔹 Paiement
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  paid_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Type(() => Date)
  payment_refunded_at?: Date;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  payment_failed_at?: Date;
}
