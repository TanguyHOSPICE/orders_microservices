import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  console.log('🚀- Orders microservice is Running');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.NATS,
      options: {
        servers: [`nats://nats`], // nats://${process.env.NATS_DNS}:${process.env.NATS_PORT} same name as docker compose
      },
    },
  );
  await app.listen();
}
bootstrap();
