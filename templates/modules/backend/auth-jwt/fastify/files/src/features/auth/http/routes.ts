import type { FastifyInstance } from "fastify";
import { createToken } from "../services/token-service";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post("/login", async () => ({ token: createToken("starter-user") }));
}
