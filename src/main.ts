import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";
import configure from "@vendia/serverless-express";

// Load and verify env variables
const result = dotenv.config({ path: ".env" });
if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`);
}

async function bootstrap() {
  // Creates express instance under the hood
  const app = await NestFactory.create(AppModule);

  // Configure app
  const expressApp = app.getHttpAdapter().getInstance();
  configure({ app: expressApp });

  // Initialize app
  await app.listen(process.env.PORT || 3001, () => {
    console.log(
      `Server is running on ${process.env.API_URL}:${process.env.API_PORT}`
    );
  });
}
bootstrap();
