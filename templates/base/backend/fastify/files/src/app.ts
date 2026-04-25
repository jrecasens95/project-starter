import Fastify from "fastify";
import { registerHealthRoutes } from "./features/health/http/routes";

export async function createApp() {
  const app = Fastify({ logger: true });
  await registerHealthRoutes(app);
  return app;
}
