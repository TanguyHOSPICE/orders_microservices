import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Mongoose connection to the database with the DNS in the .env file
    MongooseModule.forRoot(process.env.NOZAMA_ORDERS_DNS),
    OrdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
