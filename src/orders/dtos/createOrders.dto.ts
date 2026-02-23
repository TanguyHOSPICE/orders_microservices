import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EnumCurrency } from 'src/utils/enums/enums';

export class OrderItemDto {
  @IsMongoId()
  @IsNotEmpty()
  product_id: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

export class CreateOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  @IsOptional()
  @IsEnum(EnumCurrency)
  currency?: EnumCurrency;

  @IsMongoId()
  address_id: string; // Ref to address (microservice)
}
