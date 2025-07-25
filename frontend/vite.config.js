import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd()); // Load .env files

  return {
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URI,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [react()],
  };
});
