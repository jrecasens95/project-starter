import type { Express } from "express";
import { createToken } from "../services/token-service";

export function registerAuthRoutes(app: Express) {
  app.post("/login", (_request, response) => {
    response.json({ token: createToken("starter-user") });
  });
}
