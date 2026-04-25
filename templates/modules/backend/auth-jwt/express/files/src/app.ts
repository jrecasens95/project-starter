import express from "express";
import { registerHealthRoutes } from "./features/health/http/routes";
import { registerAuthRoutes } from "./features/auth/http/routes";

export function createApp() {
  const app = express();
  app.use(express.json());

  registerHealthRoutes(app);
  registerAuthRoutes(app);

  return app;
}
