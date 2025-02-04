import express from "express";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { AppModule } from "@/app.module";
import { configureApp } from "@/configApp";

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

  // configure app
  configureApp(app);

  // initilize app
  await app.init();
  return expressApp;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  if (!server) {
    server = await bootstrapServer();
  }
  server(req, res);
};
