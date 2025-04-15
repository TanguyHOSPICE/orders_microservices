import { EnumOrderStatus, EnumPaymentStatus } from '../../utils/enums/enums';

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
  status: EnumOrderStatus;
  payment_status: EnumPaymentStatus;
  address_id: string;
  payment_id?: string;
  shipped_at?: Date;
  delivered_at?: Date;
  tracking_number?: string;

  // Facultatif : seulement si on hydrate depuis un autre service
  address?: any; // ou une structure typée d’adresse
}
