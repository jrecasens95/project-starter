import Fastify from "fastify";
import { registerHealthRoutes } from "./features/health/http/routes";
import { registerAuthRoutes } from "./features/auth/http/routes";

export async function createApp() {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  return app;
}
