import {
  EnumCurrency,
  EnumOrdersStatus,
  EnumPaymentsStatus,
} from 'src/utils/enums/enums';
import { OrderItemDto } from './createOrders.dto';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueriesOrderDto {
  @IsOptional() @IsMongoId() user_id?: string;
  @IsOptional() @IsString() _id?: string;
  @IsOptional() @IsString() _ref?: string;
  @IsOptional() @IsEnum(EnumCurrency) currency?: EnumCurrency;
  @IsOptional() @IsString() address_id?: string;
  @IsOptional() @IsString() payment_id?: string;
  @IsOptional() @IsEnum(EnumOrdersStatus) status?: EnumOrdersStatus;
  @IsOptional() @IsEnum(EnumPaymentsStatus) payment_status?: EnumPaymentsStatus;

  // Items
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  // updatedAt exact
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;

  // Pagination / filtres supplémentaires
  @IsOptional() @IsNumber() @Type(() => Number) min_total_amount?: number;
  @IsOptional() @IsNumber() @Type(() => Number) max_total_amount?: number;
  @IsOptional() @IsNumber() @Type(() => Number) page?: number;
  @IsOptional() @IsNumber() @Type(() => Number) limit?: number;

  // Dates filtrables
  @IsOptional() @IsDate() @Type(() => Date) from_updatedAt?: Date;
  @IsOptional() @IsDate() @Type(() => Date) to_updatedAt?: Date;

  @IsOptional() @IsDate() @Type(() => Date) pending_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) confirmed_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) processing_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) shipped_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) delivered_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) cancelled_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) refunded_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) return_requested_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) returned_at?: Date;

  @IsOptional() @IsDate() @Type(() => Date) paid_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) payment_refunded_at?: Date;
  @IsOptional() @IsDate() @Type(() => Date) payment_failed_at?: Date;
}
