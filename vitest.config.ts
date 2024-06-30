/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    reporters: ["verbose"],
    coverage: {
      include: ['src/__tests__/**']
    },
    env: {
      NODE_ENV: "test",
    },
  },
});
