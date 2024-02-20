import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { internalIpV4 } from "internal-ip";
import * as path from "path";

const mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [vue()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: mobile ? "0.0.0.0" : "0.0.0.0",
    hmr: mobile
      ? {
          protocol: "ws",
          host: "0.0.0.0",
          port: 1421,
        }
      : undefined,

    proxy: {
      // "/settings.json": {
      //   target: "http://bluemap:8100",
      //   // target: 'https://bluecolored.de/bluemap',
      //   changeOrigin: true,
      // },
      // "/maps": {
      //   target: "http://bluemap:8100",
      //   // target: 'https://bluecolored.de/bluemap',
      //   changeOrigin: true,
      // },
    },
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ["VITE_", "TAURI_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
