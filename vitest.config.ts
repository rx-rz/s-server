/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    reporters: ["basic"],

    env: {
      NODE_ENV: "test",
    },
  },
});
