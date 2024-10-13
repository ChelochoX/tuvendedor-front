import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Esto permite que sea accesible desde cualquier dispositivo en la red
    port: 5173,      // Puedes mantener el puerto 5173 o cambiarlo si lo prefieres
  }
})
