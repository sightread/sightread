import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'

const assetBase = process.env.VITE_PUBLIC_ASSET_BASE || '/'
const routerBasename = process.env.VITE_PUBLIC_ROUTER_BASENAME || '/'

export default defineConfig({
  base: assetBase,
  plugins: [
    devtoolsJson(),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths()
  ],
})