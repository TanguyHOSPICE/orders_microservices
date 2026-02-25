import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import {
  EnumCurrency,
  EnumOrdersStatus,
  EnumPaymentsStatus,
} from '../../utils/enums/enums';

export type OrderDocument = HydratedDocument<
  Order & { createdAt: Date; updatedAt: Date }
>;

@Schema({ timestamps: true }) //delete , versionKey: false to use __v for versioning
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop([
    {
      product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ])
  items: {
    product_id: Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ type: Number, required: true })
  total_amount: number;

  @Prop({
    type: String,
    enum: EnumOrdersStatus,
    default: EnumOrdersStatus.PENDING,
  })
  status: EnumOrdersStatus;

  @Prop({
    type: String,
    enum: EnumPaymentsStatus,
    default: EnumPaymentsStatus.PENDING,
  })
  payment_status: EnumPaymentsStatus;
  @Prop({ enum: EnumCurrency, default: EnumCurrency.EUR })
  currency: string;

  // 🏠 Ref to address  (microservice)
  @Prop({ type: String, required: true })
  address_id: string; // UUID ou ObjectId string from address microservice

  @Prop()
  payment_id?: string;
  // 🔹 Champs dates pour chaque status
  @Prop({ type: Date }) pending_at?: Date;
  @Prop({ type: Date }) confirmed_at?: Date;
  @Prop({ type: Date }) processing_at?: Date;
  @Prop({ type: Date }) shipped_at?: Date;
  @Prop({ type: Date }) delivered_at?: Date;
  @Prop({ type: Date }) cancelled_at?: Date;
  @Prop({ type: Date }) refunded_at?: Date;
  @Prop({ type: Date }) return_requested_at?: Date;
  @Prop({ type: Date }) returned_at?: Date;

  // 🔹 Paiement
  @Prop({ type: Date }) paid_at?: Date;
  @Prop({ type: Date }) payment_refunded_at?: Date;
  @Prop({ type: Date }) payment_failed_at?: Date;

  @Prop({ type: String })
  tracking_number?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
