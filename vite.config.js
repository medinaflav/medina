import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        allowedHosts: ['localhost', 'medinalearn.duckdns.org'],
        hmr: {
            host: 'medinalearn.duckdns.org',
            clientPort: 443,
            protocol: 'wss',
        },
        proxy: {
            '/api': {
                target: 'http://localhost:3003',
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
