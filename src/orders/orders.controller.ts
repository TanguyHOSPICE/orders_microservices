import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dtos/createOrders.dto';

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
}
