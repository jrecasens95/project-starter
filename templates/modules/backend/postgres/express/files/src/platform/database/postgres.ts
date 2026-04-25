import { Pool } from "pg";
import { env } from "../config/env";

export const postgres = new Pool({
  connectionString: env.databaseUrl
});
