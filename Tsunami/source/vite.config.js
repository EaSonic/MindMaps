import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()], build:{rollupOptions:{output:{manualChunks:{three:['./vendor/three.module.js'],react:['react','react-dom']}}}}, server:{host:'127.0.0.1',port:4188,strictPort:true}});
