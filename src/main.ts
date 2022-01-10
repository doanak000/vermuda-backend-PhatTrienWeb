const https = require("https");
const http = require("http");
const express = require("express");
const fs = require("fs");

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpsOptions } from "@nestjs/common/interfaces/external/https-options.interface";
import * as rateLimit from "express-rate-limit";
import { ExpressAdapter } from "@nestjs/platform-express";

declare const module: any;

async function bootstrap() {
  let httpsOptions: HttpsOptions = {};
  if (process.env.NODE_ENV === "production") {
    httpsOptions = {
      key: fs.readFileSync("../secrets/vermuda-private.key"),
      cert: fs.readFileSync("../secrets/vermuda-cloud_com.crt"),
      rejectUnauthorized: false,
    };
  } else if (process.env.NODE_ENV !== "development") {
    httpsOptions = {
      key: fs.readFileSync("../secrets/private.key"),
      cert: fs.readFileSync("../secrets/mirai-chi_com.crt"),
      rejectUnauthorized: false,
    };
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 1000,
    })
  );

  await app.init();

  http.createServer(server).listen(process.env.HTTP_PORT || 3001);
  https
    .createServer(httpsOptions, server)
    .listen(process.env.HTTPS_PORT || 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
