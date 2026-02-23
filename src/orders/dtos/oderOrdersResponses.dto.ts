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
  // 🔹 Champs dates pour chaque status
  pending_at?: Date;
  confirmed_at?: Date;
  processing_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  refunded_at?: Date;
  return_requested_at?: Date;
  returned_at?: Date;

  // 🔹 Paiement
  paid_at?: Date;
  payment_refunded_at?: Date;
  payment_failed_at?: Date;

  tracking_number?: string;

  address?: any; // Ref to address (microservice)
}
