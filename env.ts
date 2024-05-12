import z from "zod";
import { config } from "dotenv";
config({ path: ".env" });
const ENV = z.object({
  HOST: z.coerce.string().default(process.env.HOST || ""),
  PORT: z.coerce.number().default(Number(process.env.PORT) || 8081),
  USER: z.literal(process.env.USER),
  DATABASE: z.literal(process.env.DATABASE),
  DB_PORT: z.literal(process.env.DB_PORT),
  PASSWORD: z.literal(process.env.PASSWORD),
  JWT_SECRET: z.literal(process.env.JWT_SECRET),
  SMTPHOST: z.coerce.string().default(process.env.SMTPHOST || ""),
  SMTPPORT: z.coerce.number().default(Number(process.env.SMTPPORT) || 0),
  SMTPUSER: z.literal(process.env.SMTPUSER),
  SMTPPASS: z.literal(process.env.SMTPPASS),
});

export const ENV_VARS = ENV.parse(process.env);
