import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
const isProduction = process.env.NODE_ENV === 'production';

// This ensures the base path is set correctly for GitHub Pages
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/mic/' : '/',  // Keep it as is, OR try changing to './'
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  plugins: [
    react(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
}));
