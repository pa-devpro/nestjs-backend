import { HttpException, HttpStatus } from "@nestjs/common";

// Custom exception for 400 Bad Request errors
export class ValidationException extends HttpException {
  constructor(errors: any) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Validation Error",
        details: errors,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
