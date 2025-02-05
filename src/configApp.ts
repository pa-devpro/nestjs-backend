import { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import * as express from "express";
import compression from "compression";
import { HttpExceptionFilter } from "./common/filters/http-exception";

export const configureApp = (app: INestApplication) => {
  const expressApp = app.getHttpAdapter().getInstance() as express.Application;
  // Global Exception Filter for advanced error handling.
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe for input validation.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Trust proxy for rate limiting behind reverse proxy
  expressApp.set("trust proxy", 1);

  // Security headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      // Ensure proper IP detection behind proxy
      keyGenerator: (req) => {
        return (
          req.ip ||
          (req.headers["x-forwarded-for"] as string) ||
          req.socket.remoteAddress ||
          "unknown"
        );
      },
    })
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS
  app.enableCors({
    origin: (
      origin: string,
      callback: (arg0: Error | null, arg1: boolean) => void
    ) => {
      const allowed = process.env.CLIENT_URL?.replace(/\/$/, "");
      const requestOrigin = origin?.replace(/\/$/, "");
      if (!origin || requestOrigin === allowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept",
    credentials: true,
  });
};
