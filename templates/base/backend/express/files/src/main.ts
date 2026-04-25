import { createApp } from "./app";
import { env } from "./platform/config/env";

const app = createApp();

app.listen(Number(env.port), () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
