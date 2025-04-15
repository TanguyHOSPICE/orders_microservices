import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomException } from './custom_exception.exception';

@Catch(CustomException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: CustomException, host: ArgumentsHost) {
    //*Initialisation de la variable host qui contient le contexte de l'exception
    const ctx = host.switchToHttp();
    //*Initialisation de la variable response qui contient la réponse de l'exception
    const response = ctx.getResponse<Response>();
    //*Initialisation de la variable request qui contient la requête de l'exception
    const request = ctx.getRequest<Request>();
    //*Initialisation de la variable status qui contient le statut de l'exception
    const status = exception.getStatus();

    //* déclaration de la fonction formatDate qui prend en paramètre une date et qui retourne une chaîne de caractères formatée en fonction de la date passée en paramètre
    const formatDate = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const timestamp = formatDate(new Date());
    //*Envoi de la réponse de l'exception avec le statut, le code d'erreur, le timestamp et le message de l'exception
    response.status(status).json({
      statusCode: status,
      codeError: exception.codeError,
      timestamp: timestamp,
      message: exception.message,
    });
  }
}
