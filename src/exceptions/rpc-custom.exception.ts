import { RpcException } from '@nestjs/microservices';

export class RpcCustomException extends RpcException {
  public readonly codeError: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number, codeError: string) {
    super({
      message,
      statusCode,
      codeError,
      timestamp: new Date().toISOString(),
    });

    this.codeError = codeError;
    this.statusCode = statusCode;
  }
}
