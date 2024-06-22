import z from "zod";
import { config } from "dotenv";

config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });
const ENV = z.object({
  HOST: z.coerce.string().default(process.env.HOST || ""),
  PORT: z.coerce.number().default(Number(process.env.PORT) || 8081),
  USER: z.literal(process.env.USER),
  DATABASE: z.literal(process.env.DATABASE),
  TEST_DATABASE: z.literal(process.env.TEST_DATABASE),
  DB_PORT: z.literal(process.env.DB_PORT),
  PASSWORD: z.literal(process.env.PASSWORD),
  JWT_SECRET: z.literal(process.env.JWT_SECRET),
  SMTPHOST: z.coerce.string().default(process.env.SMTPHOST || ""),
  SMTPPORT: z.coerce.number().default(Number(process.env.SMTPPORT) || 0),
  SMTPUSER: z.literal(process.env.SMTPUSER),
  SMTPPASS: z.literal(process.env.SMTPPASS),
  PAYMENT_PUBLIC_KEY: z.literal(process.env.PAYMENT_PUBLIC_KEY),
  PAYMENT_SECRET_KEY: z.literal(process.env.PAYMENT_SECRET_KEY).default(""),
  NODE_ENV: z.literal(process.env.NODE_ENV).default("development"),
  PRODUCTION_CONNECTION_STRING: z
    .literal(process.env.PRODUCTION_CONNECTION_STRING)
    .default(""),
  JWT_REFRESH_SECRET: z.literal(process.env.JWT_REFRESH_SECRET).default(""),
});

export const ENV_VARS = ENV.parse(process.env);