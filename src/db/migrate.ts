import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { client, db } from "./db";

export async function migrateToDb() {
  await client.connect();
  await migrate(db, { migrationsFolder: "migrations" })
    .then(() => {
      console.log("Migrated! ✨✨");
    })
    .finally(async () => {
      await client.end();
    })
    .catch((err) => {
      console.trace(err);
    });
}
migrateToDb();
