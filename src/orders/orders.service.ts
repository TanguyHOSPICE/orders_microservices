import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { ClientProxy } from '@nestjs/microservices';
import { CreateOrderDto } from './dtos/createOrders.dto';
import { RpcCustomException } from 'src/exceptions/rpc-custom.exception';
import { lastValueFrom } from 'rxjs';
import {
  EnumCurrency,
  EnumOrdersStatus,
  EnumPaymentsStatus,
} from 'src/utils/enums/enums';
import { UpdateOrderDto } from './dtos/updateOrders.dto';
import { IUser } from 'src/utils/interfaces/interfaces';
import { generateRef } from 'src/utils/functions/orderFunction';
import { QueriesOrderDto } from './dtos/queriesOrderDto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<Order>,
    @Inject('NATS_GATEWAY') private readonly nats: ClientProxy,
  ) {}
  // Transition guard
  // private isValidStatusTransition(
  //   current: EnumOrdersStatus,
  //   next: EnumOrdersStatus,
  // ): boolean {
  //   const transitions = {
  //     [EnumOrdersStatus.PENDING]: [
  //       EnumOrdersStatus.CONFIRMED,
  //       EnumOrdersStatus.CANCELLED,
  //     ],
  //     [EnumOrdersStatus.CONFIRMED]: [
  //       EnumOrdersStatus.PROCESSING,
  //       EnumOrdersStatus.CANCELLED,
  //     ],
  //     [EnumOrdersStatus.PROCESSING]: [EnumOrdersStatus.SHIPPED],
  //     [EnumOrdersStatus.SHIPPED]: [
  //       EnumOrdersStatus.DELIVERED,
  //       EnumOrdersStatus.RETURN_REQUESTED,
  //     ],
  //     [EnumOrdersStatus.DELIVERED]: [],
  //     [EnumOrdersStatus.CANCELLED]: [],
  //   };

  //   return transitions[current]?.includes(next);
  // }

  async createOrder(createOrderDto: CreateOrderDto) {
    const { user_id, items, address_id, ...rest } = createOrderDto;

    // Check if user exists
    let user: IUser;
    try {
      user = await lastValueFrom(
        this.nats.send('USER_GET_USER_BY_ID', { _id: user_id }),
      );
    } catch {
      throw new RpcCustomException(
        'Error fetching user ~ (Ord_S)',
        HttpStatus.INTERNAL_SERVER_ERROR,
        '500',
      );
    }
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
    // Generate order reference
    let orderRef = await generateRef('ORD');
    let counter = 0;
    while (await this.orderModel.findOne({ _ref: orderRef })) {
      counter++;
      orderRef = `${orderRef}-${counter}`;
    }
    // Create a new order instance
    const newOrder = new this.orderModel({
      user_id,
      items,
      total_amount,
      address_id,
      status: EnumOrdersStatus.PENDING,
      payment_status: EnumPaymentsStatus.PENDING,
      currency: user?.currency || EnumCurrency.EUR,
      _ref: orderRef,
      ...rest,
    });
    // Save the order to the database
    const saveOrder = await newOrder.save();

    // 🔄 Update the user orders fiels with the new order id
    try {
      await lastValueFrom(
        this.nats.send('USER_UPDATE', {
          _id: user_id,
          update: { $addToSet: { orders: saveOrder._id } },
        }),
      );
      return saveOrder;
    } catch (error) {
      console.error('❌ Error updating user payments ~ (Ord_S) :', error);
    }
  }
  // 🔹 Get Order by ID
  async getOrderById(order_id: string) {
    if (!Types.ObjectId.isValid(order_id)) {
      throw new RpcCustomException(
        'Invalid Order ID format',
        HttpStatus.BAD_REQUEST,
        '400',
      );
    }

    const order = await this.orderModel.findById(order_id);

    if (!order) {
      throw new RpcCustomException(
        `Order with ID ${order_id} not found`,
        HttpStatus.NOT_FOUND,
        '404',
      );
    }

    return order;
  }

  // 🔹 Get All Orders (optionnel par user_id)
  async getAllOrders(query?: QueriesOrderDto) {
    try {
      const filter: any = {};
      if (query?._id) filter._id = query._id;
      if (query?.user_id && Types.ObjectId.isValid(query.user_id)) {
        filter.user_id = new Types.ObjectId(query.user_id);
      }
      if (query?._ref) filter._ref = query._ref;
      if (query?.status) filter.status = query.status;
      if (query?.payment_status) filter.payment_status = query.payment_status;
      if (query?.currency) filter.currency = query.currency;

      const orders = await this.orderModel.find(filter).exec();

      if (!orders.length) {
        throw new RpcCustomException(
          'No orders found ~ (Ord_S)',
          HttpStatus.NOT_FOUND,
          '404',
        );
      }

      return orders;
    } catch (error) {
      console.error('❌ Error in getAllOrders ~ (Ord_S) :', error);
      throw error;
    }
  }

  //   Création du paiement (createPayment)
  // Si le status du paiement est PAID dès la création :
  // Mettre à jour automatiquement payment_status de la commande via updateOrder.
  // Réserver le stock.
  // Si stock OK → commande SHIPPED.
  // Gérer automatiquement les dates paid_at et shipped_at.
  // Optimistic lock :
  // Utiliser __v pour éviter que deux services modifient la commande en même temps.
  // Si conflit → renvoyer 409.
  // Dates automatiques :
  // status → status_at (shipped_at, delivered_at, etc.)
  // payment_status → payment_paid_at, etc.
  // Microservices :
  // STOCK_RESERVE_PRODUCTS → fail → rollback / exception.
  // USER_UPDATE → ajouter orders ou payments.
  // TypeScript safe :
  // updatedAt et createdAt typés correctement dans OrderDocument.
  // 🔹 Update Order

  async updateOrder(order_id: string, update: UpdateOrderDto) {
    if (!Types.ObjectId.isValid(order_id)) {
      throw new RpcCustomException(
        'Invalid Order ID format',
        HttpStatus.BAD_REQUEST,
        '400',
      );
    }

    const order = await this.orderModel.findById(order_id);

    if (!order) {
      throw new RpcCustomException(
        `Order with ID ${order_id} not found`,
        HttpStatus.NOT_FOUND,
        '404',
      );
    }

    // 🔥 1️⃣ Le paiement devient PAID ?
    const isBecomingPaid =
      update.payment_status === EnumPaymentsStatus.PAID &&
      order.payment_status !== EnumPaymentsStatus.PAID;

    if (isBecomingPaid) {
      // 🔥 2️⃣ Réserver le stock dans Product MS
      const stockResponse = await lastValueFrom(
        this.nats.send('STOCK_RESERVE_PRODUCTS', {
          items: order.items,
        }),
      );

      if (!stockResponse?.success) {
        throw new RpcCustomException(
          'Stock reservation failed',
          HttpStatus.CONFLICT,
          '409',
        );
      }

      // 🔥 3️⃣ Si stock OK → on passe en PROCESSING
      update.status = EnumOrdersStatus.PROCESSING;
    }

    // 🔹 Dates automatiques status
    if (update.status) {
      const statusField = `${update.status.toLowerCase()}_at`;
      (update as any)[statusField] = new Date();
    }

    // 🔹 Dates automatiques paiement
    if (update.payment_status) {
      const paymentField = `${update.payment_status.toLowerCase()}_at`;
      (update as any)[paymentField] = new Date();
    }

    // 🔒 Optimistic Lock
    const updatedOrder = await this.orderModel.findOneAndUpdate(
      { _id: order_id, __v: order.__v },
      { $set: update, $inc: { __v: 1 } },
      { new: true },
    );

    if (!updatedOrder) {
      throw new RpcCustomException(
        'Concurrent update detected',
        HttpStatus.CONFLICT,
        '409',
      );
    }

    return updatedOrder;
  }
  // 🔹 Delete Order
  async deleteOrder(order_id: string) {
    if (!Types.ObjectId.isValid(order_id)) {
      throw new RpcCustomException(
        'Invalid Order ID format',
        HttpStatus.BAD_REQUEST,
        '400',
      );
    }

    const order = await this.orderModel.findByIdAndDelete(order_id);
    if (!order) {
      throw new RpcCustomException(
        `Order with ID ${order_id} not found`,
        HttpStatus.NOT_FOUND,
        '404',
      );
    }

    // Retirer la référence de commande de l'utilisateur
    await lastValueFrom(
      this.nats.send('USER_UPDATE', {
        _id: order.user_id,
        update: { $pull: { orders: order._id } },
      }),
    );

    return { message: `Order ${order_id} deleted successfully` };
  }
}
