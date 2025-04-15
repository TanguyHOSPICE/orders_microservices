import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { EnumOrderStatus } from 'src/utils/enums/enums';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true, versionKey: false })
export class Order {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true })
  user_id: mongoose.Schema.Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  })
  product_id?: mongoose.Types.ObjectId[];
  @Prop({ required: true })
  nb_of_items: number;
  @Prop({ required: true })
  amount: number;
  @Prop({ required: true })
  currency: string;
  @Prop({ enum: EnumOrderStatus, default: EnumOrderStatus.PENDING })
  status: string;
  @Prop()
  _ref: string;
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'payments' }] })
  payments?: mongoose.Types.ObjectId[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
