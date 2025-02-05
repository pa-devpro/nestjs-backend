import { HttpException, HttpStatus } from "@nestjs/common";

// Custom exception for 404 Not Found errors
export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: "Not Found",
        message,
      },
      HttpStatus.NOT_FOUND
    );
  }
}
