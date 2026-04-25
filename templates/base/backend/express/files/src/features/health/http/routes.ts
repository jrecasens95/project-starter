import type { Express } from "express";

export function registerHealthRoutes(app: Express) {
  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });
}
