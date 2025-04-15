import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersMicroserviceController {
  constructor(private readonly ordersService: OrdersService) {}
}
