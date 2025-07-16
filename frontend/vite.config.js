import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { BACKEND_URI } from './src/services/apiService'

// Load env file based on `mode` (e.g. .env.development, .env.production)
// const env = loadEnv(mode, process.cwd());

// console.log(env)

// https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       '/api': {
//         target: `${BACKEND_URI}`,
//         changeOrigin: true,
//         secure: true
//       },
//     }
//   },
//   plugins: [react()],
// })




export default defineConfig(({ mode }) => {
  // Load env file based on `mode` (e.g. .env.development, .env.production)
  const env = loadEnv(mode, process.cwd());
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
