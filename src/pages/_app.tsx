import '@/styles/global.css'
import '@/styles/Tooltip.css'

import type { AppProps } from 'next/app'
import * as React from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Inter } from '@next/font/google'

import * as analytics from '@/features/analytics'

const inter = Inter({
  subsets: ['latin'],
  variable: '--primary-font-family',
})

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  React.useEffect(() => {
    const handleRouteChange = (url: string) => analytics.pageview(url)
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
