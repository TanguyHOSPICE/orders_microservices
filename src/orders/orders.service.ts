import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './schemas/order.schema';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dtos/createOrders.dto';
import { RpcCustomException } from 'src/exceptions/rpc-custom.exception';
import { lastValueFrom } from 'rxjs';
import { EnumOrdersStatus, EnumPaymentsStatus } from 'src/utils/enums/enums';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @Inject('NATS_GATEWAY') private readonly nats: ClientProxy,
  ) {}

  async createOrder({ user_id, items, address_id }: CreateOrderDto) {
    // Check if user exists
    const user = await lastValueFrom(
      this.nats.send('USER_GET_USER_BY_ID', { _id: user_id }),
    );
    // console.log("🧙🏽‍♂️ ~ OrdersService ~ createOrder ~ user:", user) // ! dev tool

    if (!user) {
      throw new RpcCustomException(
        'User not found',
        HttpStatus.NOT_FOUND,
        '404',
      );
    }
    // Calculate total amount
    const total_amount = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );
    // Create a new order instance
    const newOrder = new this.orderModel({
      user_id,
      items,
      total_amount,
      address_id,
      status: EnumOrdersStatus.PENDING,
      payment_status: EnumPaymentsStatus.PENDING,
    });
    // Save the order to the database
    const saveOrder = await newOrder.save();

    // 🔄 Update the user orders fiels with the new order id
    await lastValueFrom(
      this.nats.send('USER_UPDATE', {
        _id: user_id,
        update: { $addToSet: { orders: saveOrder._id } },
      }),
    );

    return saveOrder;
  }
}
