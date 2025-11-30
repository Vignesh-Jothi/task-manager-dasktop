import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const alias = {
  "@shared": resolve(__dirname, "src/shared"),
  "@features": resolve(__dirname, "src/renderer/features"),
  "@ui": resolve(__dirname, "src/renderer/ui/primitives"),
  "@app": resolve(__dirname, "src/renderer/app"),
  "@types": resolve(__dirname, "src/shared/types/index.ts"),
};

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist/renderer",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias,
  },
});
