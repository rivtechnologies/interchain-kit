// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true, // 生成 index.d.ts
        }),
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: '@interchain-kit/vue',
            fileName: (format) => `index.${format}.js`,
            formats: ['es', 'umd'], // 这里指定生成的格式，可以根据需求修改
        },
        rollupOptions: {
            external: ['vue', '@interchain-kit/core'], // 不打包 Vue
        },
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    }
})
