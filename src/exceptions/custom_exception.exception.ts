import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  codeError: string; // Propriété pour stocker le code d'erreur

  constructor(message: string, HttpStatus: HttpStatus, codeError: string) {
    //
    super(message, HttpStatus);
    this.codeError = codeError;
  } // Constructeur de la classe CustomException qui hérite de la classe HttpException de NestJS et qui prend en paramètre un message, un HttpStatus et un code d'erreur pour initialiser les propriétés de la classe CustomException
}
