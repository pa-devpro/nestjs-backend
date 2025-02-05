import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status = exception.getStatus();
    const response = exception.getResponse();
    let errorResponse;

    if (typeof response === "string") {
      errorResponse = { error: response };
    } else if (typeof response === "object") {
      errorResponse = { ...response } as object;
    } else {
      errorResponse = { error: "Internal server error" };
    }

    // If it's a validation error with an array of messages, do not override them.
    if (
      status === HttpStatus.BAD_REQUEST &&
      (errorResponse as any).message instanceof Array
    ) {
    } else {
      errorResponse = {
        ...errorResponse,
      };
    }

    res.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: req.url,
      ...errorResponse,
    });
  }
}
