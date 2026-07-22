import { defineNitroConfig } from "nitropack";

export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-12-01",
  runtimeConfig: {
    jwtSecret: { default: "change-me-in-production-sequent-jwt" },
    comicVineApiKey: { default: "" },
  },
  devServer: {
    host: "0.0.0.0",
    watch: ["server"],
  },
  imports: {
    dirs: ["server/utils"],
  },
  storage: {
    cache: { driver: "fs", base: "./cache" },
  },
});
