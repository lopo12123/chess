import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [ vue() ],
    server: {
        port: 5555
    },
    resolve: {
        alias: {
            '@': resolve('src')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                charset: false
            }
        }
    },
    build: {
        outDir: './docs'
    }
})
