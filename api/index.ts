import express from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { AppModule } from "../src/app.module";
import { VercelRequest, VercelResponse } from "@vercel/node";

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
    origin: process.env.CLIENT_URL,
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
