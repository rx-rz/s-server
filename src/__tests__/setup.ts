import { afterAll, beforeAll } from "vitest";
import { startTestServer, stopTestServer } from "../setup-tests";
import { app } from "../app";
import request from "supertest";
import { ENV_VARS } from "../../env";
import { sign } from "jsonwebtoken";
import { decodeUserToken } from "../middleware/determine-user-role";
beforeAll(async () => {
  // using 0 means the OS will find an available port
  await startTestServer(0);
});


afterAll(async () => {
  await stopTestServer();
});


function generateJWTToken(role: "ADMIN" | "CUSTOMER") {
  const secret = ENV_VARS.JWT_SECRET || "secret";
  return sign({user: {role}}, secret, { expiresIn: "10m" });
}

function generateRefreshToken(role: "ADMIN" | "CUSTOMER") {
  const secret = ENV_VARS.JWT_REFRESH_SECRET || "refresh-secret";
  return sign({user: {role}}, secret, { expiresIn: "7d" });
}

const tokens = {
  ADMIN: {
    accessToken: generateJWTToken("ADMIN"),
    refreshToken: generateRefreshToken("ADMIN"),
  },
  CUSTOMER: {
    accessToken: generateJWTToken("CUSTOMER"),
    refreshToken: generateRefreshToken("CUSTOMER"),
  },
};

export const testApi = request.agent(app);

export const authenticatedTestApi = (role: "ADMIN" | "CUSTOMER") => {
  testApi.set("Authorization", `Bearer ${tokens[role].accessToken}`);
  return testApi;
};
