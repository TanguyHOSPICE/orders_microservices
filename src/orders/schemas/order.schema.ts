// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { HydratedDocument } from 'mongoose';
// import { EnumOrderStatus } from 'src/utils/enums/enums';

// export type OrderDocument = HydratedDocument<Order>;

// @Schema({ timestamps: true, versionKey: false })
// export class Order {
//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
//   user_id: mongoose.Schema.Types.ObjectId;
//   @Prop({
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'products',
//     required: true,
//   })
//   product_id?: mongoose.Types.ObjectId[];
//   @Prop({ required: true })
//   nb_of_items: number;
//   @Prop({ required: true })
//   amount: number;
//   @Prop({ required: true })
//   currency: string;
//   @Prop({ enum: EnumOrderStatus, default: EnumOrderStatus.PENDING })
//   status: string;
//   @Prop()
//   _ref: string;
//   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'payments' }] })
//   payments?: mongoose.Types.ObjectId[];
// }

// export const OrderSchema = SchemaFactory.createForClass(Order);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EnumOrderStatus, EnumPaymentStatus } from '../../utils/enums/enums';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user_id: mongoose.Types.ObjectId;

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
    product_id: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }[];

  @Prop({ type: Number, required: true })
  total_amount: number;

  @Prop({
    type: String,
    enum: EnumOrderStatus,
    default: EnumOrderStatus.PENDING,
  })
  status: EnumOrderStatus;

  @Prop({
    type: String,
    enum: EnumPaymentStatus,
    default: EnumPaymentStatus.PENDING,
  })
  payment_status: EnumPaymentStatus;

  // 🏠 Ref to address  (microservice)
  @Prop({ type: String, required: true })
  address_id: string; // UUID ou ObjectId string from address microservice

  @Prop()
  payment_id?: string;

  @Prop({ type: Date })
  shipped_at?: Date;

  @Prop({ type: Date })
  delivered_at?: Date;

  @Prop({ type: String })
  tracking_number?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
