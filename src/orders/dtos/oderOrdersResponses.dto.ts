import {
  EnumAddressStatus,
  EnumAddressType,
  EnumCurrency,
  EnumOrdersStatus,
  EnumPaymentsStatus,
} from '../../utils/enums/enums';

export class OrderItemResponseDto {
  product_id: string;
  quantity: number;
  price: number;
}

export class AddressResponseDto {
  address_id: string;
  full_name?: string;

  street: string;

  city: string;

  postal_code: string;

  country: string;

  state?: string;

  phone_number?: string;

  is_default?: boolean;

  type?: EnumAddressType;

  status?: EnumAddressStatus;
}

export class OrderResponseDto {
  _id: string;
  _ref: string;

  user_id: string;

  items: OrderItemResponseDto[];

  total_amount: number;
  currency: EnumCurrency;

  status: EnumOrdersStatus;
  payment_status: EnumPaymentsStatus;

  addresses?: AddressResponseDto[];
  payment_id?: string;

  // Dates status
  pending_at?: Date;
  confirmed_at?: Date;
  processing_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  refunded_at?: Date;
  return_requested_at?: Date;
  returned_at?: Date;

  // Paiement
  paid_at?: Date;
  payment_refunded_at?: Date;
  payment_failed_at?: Date;

  tracking_number?: string;

  createdAt: Date;
  updatedAt: Date;
}
