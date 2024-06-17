import { IncomingMessage, Server, ServerResponse } from "http";
import { ENV_VARS } from "../env";
import { app } from "./app";
import { Express } from "express";
import { connectToDb, endDBConnection } from "./db/db";
let server: Server<typeof IncomingMessage, typeof ServerResponse>;

export const startTestServer = (portNo= 3892): Promise<ReturnType<Express["listen"]>> => {  
  return new Promise((resolve, reject) => {
    server = app.listen(portNo, ENV_VARS.HOST, async () => {
      try {
        await connectToDb().then(() => {
          console.log("Connected To Test DB.");
        });
        console.log(`\n Test Server Running. 🚀 \n`);
        resolve(server);
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const stopTestServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close(async (err: Error | undefined) => {
      if (err) return reject(err);
      await endDBConnection();
      console.log("Server and database connection closed");
      resolve();
    });
  });
};
