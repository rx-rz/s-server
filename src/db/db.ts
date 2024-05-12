import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
config({ path: ".env" });
import { Client } from "pg";
import { ENV_VARS } from "../../env";
import { dbSchema } from "./schema";

export const client = new Client({
  host: ENV_VARS.HOST,
  port: parseInt(ENV_VARS.DB_PORT!),
  user: ENV_VARS.USER,
  database: ENV_VARS.DATABASE,
  password: ENV_VARS.PASSWORD,
});

export async function connectToDb() {
  client.connect((err) => {
    if (err) console.trace(err);
    console.log("Connected to DB. ✨✨");
  });
}

export const db = drizzle(client, { schema: dbSchema });
export const dbType = typeof db;
