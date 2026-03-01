import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/createOrders.dto';
import { UpdateOrderDto } from './dtos/updateOrders.dto';
import { QueriesOrderDto } from './dtos/queriesOrderDto';
import { Order } from './schemas/order.schema';

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('ORDER_CREATE')
  async createOrder(@Payload() data: CreateOrderDto) {
    // console.log(
    //   '🧙🏽‍♂️ ~ OrdersMicroserviceController ~ createOrder ~ data:',
    //   data,
    // ); // ! dev tool
    try {
      return await this.ordersService.createOrder(data);
    } catch (error) {
      throw error;
    }
  }
  // 🔹 GET BY ID
  @MessagePattern('ORDER_GET_BY_ID')
  async getOrderById(@Payload() data: { order_id: string }) {
    try {
      return await this.ordersService.getOrderById(data.order_id);
    } catch (error) {
      throw error;
    }
  }

  // 🔹 GET ALL (optionnellement par user_id)
  @MessagePattern('ORDER_GET_ALL')
  async getAllOrders(@Payload() query: QueriesOrderDto): Promise<Order[]> {
    try {
      return await this.ordersService.getAllOrders(query);
    } catch (error) {
      throw error;
    }
  }

  // 🔹 UPDATE
  @MessagePattern('ORDER_UPDATE')
  async updateOrder(
    @Payload()
    data: {
      order_id: string;
      update: UpdateOrderDto;
    },
  ) {
    try {
      return await this.ordersService.updateOrder(data.order_id, data.update);
    } catch (error) {
      throw error;
    }
  }

  // 🔹 DELETE
  @MessagePattern('ORDER_DELETE')
  async deleteOrder(@Payload() data: { order_id: string }) {
    try {
      return await this.ordersService.deleteOrder(data.order_id);
    } catch (error) {
      throw error;
    }
  }
}
