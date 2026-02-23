import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/createOrders.dto';
import { UpdateOrderDto } from './dtos/updateOrders.dto';

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('ORDER_CREATE')
  async createOrder(@Payload() data: CreateOrderDto) {
    // console.log(
    //   '🧙🏽‍♂️ ~ OrdersMicroserviceController ~ createOrder ~ data:',
    //   data,
    // ); // ! dev tool
    return await this.ordersService.createOrder(data);
  }
  // 🔹 GET BY ID
  @MessagePattern('ORDER_GET_BY_ID')
  async getOrderById(@Payload() data: { order_id: string }) {
    return await this.ordersService.getOrderById(data.order_id);
  }

  // 🔹 GET ALL (optionnellement par user_id)
  @MessagePattern('ORDER_GET_ALL')
  async getAllOrders(@Payload() data?: { user_id?: string }) {
    return await this.ordersService.getAllOrders(data?.user_id);
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
    return await this.ordersService.updateOrder(data.order_id, data.update);
  }

  // 🔹 DELETE
  @MessagePattern('ORDER_DELETE')
  async deleteOrder(@Payload() data: { order_id: string }) {
    return await this.ordersService.deleteOrder(data.order_id);
  }
}
