import { HttpException, HttpStatus } from "@nestjs/common";

// Custom exception for 409 Conflict errors
// For cases like resource conflict (e.g. duplicate record):
export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: "Conflict",
        message,
      },
      HttpStatus.CONFLICT
    );
  }
}
