import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5175,
    strictPort: true,
    cors: true,
    hmr: {
      overlay: false,
      host: "100.123.128.103",
      port: 5175,
      protocol: "ws",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom', 'framer-motion'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-accordion', '@radix-ui/react-separator', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip', '@radix-ui/react-toggle'],
          'animation-vendor': ['framer-motion'],
          'icons-vendor': ['lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb
    chunkSizeWarningLimit: 600,
  },
}));
