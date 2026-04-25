import { Pool } from "pg";

export const postgres = new Pool({
  connectionString: process.env.DATABASE_URL ?? ""
});
