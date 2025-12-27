import type { Config } from '@react-router/dev/config'

const routerBasename = process.env.VITE_PUBLIC_ROUTER_BASENAME || "/";

export default {
  appDirectory: 'src/pages',
  ssr: false, // enable SPA mode
  basename: routerBasename, // tell React Router the base URL
} satisfies Config
