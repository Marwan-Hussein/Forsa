import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  build: {
    outDir: "../Forsa/wwwroot",
    emptyOutDir: true
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://forsa-app.runasp.net/',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'https://forsa-app.runasp.net/',
        changeOrigin: true,
        secure: false,
      }
    }
  },
});
