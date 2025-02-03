import express from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { AppModule } from "@/app.module";

let server: express.Express;

/**
 * File setup for vercel deployments with serverless-express.
 *
 * Initializes and configures the NestJS application with an Express adapter.
 */
async function bootstrapServer(): Promise<express.Express> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp)
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
  await app.init();
  return expressApp;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!server) {
    server = await bootstrapServer();
  }
  server(req, res);
};
