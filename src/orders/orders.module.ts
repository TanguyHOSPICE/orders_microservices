import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NatsClientModule } from 'src/nats-client/nats-client.module';
import { OrdersMicroserviceController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema, collection: 'orders' },
    ]),
    NatsClientModule,
  ],
  controllers: [OrdersMicroserviceController],
  providers: [OrdersService],
})
export class OrdersModule {}
