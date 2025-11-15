import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import tsconfigPaths from 'vite-tsconfig-paths'
import { metadataApiPlugin } from './vite-plugin-metadata-api'

export default defineConfig({
  plugins: [metadataApiPlugin(), devtoolsJson(), tailwindcss(), reactRouter(), tsconfigPaths()],
})
