import { afterAll, beforeAll } from "vitest";
import { startTestServer, stopTestServer } from "../setup-tests";
import { app } from "../app";
import request from "supertest";
import { ENV_VARS } from "../../env";
import { sign } from "jsonwebtoken";
beforeAll(async () => {
  // using 0 means the OS will find an available port
  await startTestServer(0);
});

afterAll(async () => {
  await stopTestServer();
});

function generateJWTToken(role: "ADMIN" | "CUSTOMER") {
  const secret = ENV_VARS.JWT_SECRET || "secret";
  const payload = { role };
  return sign(payload, secret, { expiresIn: "10m" });
}

const tokens = {
  ADMIN: generateJWTToken("ADMIN"),
  CUSTOMER: generateJWTToken("CUSTOMER"),
};

export const testApi = request.agent(app);

export const authenticatedTestApi = (role: "ADMIN" | "CUSTOMER") => {
  return testApi.set("Authorization", `Bearer ${tokens[role]}`)
}
