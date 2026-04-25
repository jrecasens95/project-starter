import jwt from "jsonwebtoken";
import { env } from "../../../platform/config/env";

export function createToken(subject: string) {
  return jwt.sign({ sub: subject }, env.jwtSecret || "change-me", {
    expiresIn: "1d"
  });
}
