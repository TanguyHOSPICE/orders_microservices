import {
  ArgumentsHost,
  Catch,
  RpcExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { CustomException } from './custom_exception.exception';

@Catch(CustomException, HttpException)
export class RpcExceptionsFilter implements RpcExceptionFilter {
  catch(
    exception: CustomException | HttpException,
    host: ArgumentsHost,
  ): Observable<any> {
    const status =
      exception instanceof CustomException || exception instanceof HttpException
        ? exception.getStatus()
        : 500;

    const response = {
      statusCode: status,
      message: exception.message,
      codeError: (exception as CustomException).codeError || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };

    return throwError(() => response);
  }
}
