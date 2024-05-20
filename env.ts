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
  FIREBASE_API_KEY: z.literal(process.env.FIREBASE_API_KEY),
  FIREBASE_AUTH_DOMAIN: z.literal(process.env.FIREBASE_AUTH_DOMAIN),
  FIREBASE_PROJECT_ID: z.literal(process.env.FIREBASE_PROJECT_ID),
  FIREBASE_STORAGE_BUCKET: z.literal(process.env.FIREBASE_STORAGE_BUCKET),
  FIREBASE_MESSAGING_SENDER_ID: z.literal(
    process.env.FIREBASE_MESSAGING_SENDER_ID
  ),
  FIREBASE_APP_ID: z.literal(process.env.FIREBASE_APP_ID),
  PAYMENT_PUBLIC_KEY: z.literal(process.env.PAYMENT_PUBLIC_KEY),
  PAYMENT_SECRET_KEY: z.literal(process.env.PAYMENT_SECRET_KEY),
});

export const ENV_VARS = ENV.parse(process.env);
