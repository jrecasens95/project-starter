import { createApp } from "./app";
import { env } from "./platform/config/env";

async function bootstrap() {
  const app = await createApp();
  await app.listen({ port: Number(env.port), host: "0.0.0.0" });
}

void bootstrap();
