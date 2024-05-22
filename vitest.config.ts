/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    reporters: ["verbose"],
    env: {
      NODE_ENV: "test",
    },
  },
});
