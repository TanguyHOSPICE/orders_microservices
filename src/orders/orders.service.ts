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
      currency: user?.currency || EnumCurrency.EUR,
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
  async getAllOrders(user_id?: string) {
    const filter: any = {};
    if (user_id) {
      if (!Types.ObjectId.isValid(user_id)) {
        throw new RpcCustomException(
          'Invalid User ID format',
          HttpStatus.BAD_REQUEST,
          '400',
        );
      }
      filter.user_id = new Types.ObjectId(user_id);
    }

    const orders = await this.orderModel.find(filter).exec();

    if (!orders.length) {
      throw new RpcCustomException(
        'No orders found',
        HttpStatus.NOT_FOUND,
        '404',
      );
    }

    return orders;
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
