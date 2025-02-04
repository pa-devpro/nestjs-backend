import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import { ValidationPipe } from "@nestjs/common";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

// Load and verify env variables
const result = dotenv.config({ path: ".env" });
if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers
  app.use(helmet());

  // Compression
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
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

  app.enableCors({
    origin: (
      origin: string,
      callback: (arg0: Error | null, arg1: boolean | undefined) => void
    ) => {
      // Remove trailing slash (if any) from the allowed origin.
      const allowed = process.env.CLIENT_URL?.replace(/\/$/, "");
      // Remove trailing slash from the received origin.
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
  await app.listen(process.env.PORT || 3001, () => {
    console.log(
      `Server is running on ${process.env.API_URL}:${process.env.API_PORT}`
    );
  });
}
bootstrap();
