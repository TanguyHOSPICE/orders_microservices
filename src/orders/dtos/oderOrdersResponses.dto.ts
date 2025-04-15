import { EnumOrdersStatus, EnumPaymentsStatus } from '../../utils/enums/enums';

export class OrderItemResponseDto {
  product_id: string;
  quantity: number;
  price: number;
}

export class OrderResponseDto {
  _id: string;
  user_id: string;
  items: OrderItemResponseDto[];
  total_amount: number;
  status: EnumOrdersStatus;
  payment_status: EnumPaymentsStatus;
  address_id: string;
  payment_id?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  tracking_number?: string;

  address?: any; // Ref to address (microservice)
}
