import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

// Load and verify env variables
const result = dotenv.config({ path: ".env" });
if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_URL,
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
