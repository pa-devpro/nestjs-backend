import { HttpException, HttpStatus } from "@nestjs/common";

// Custom exception for database errors
export class DatabaseException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: "Database Error",
        message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
