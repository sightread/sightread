import '@/styles/global.css'

import type { AppProps } from 'next/app'
import * as React from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Inter } from '@next/font/google'

import * as analytics from '@/features/analytics'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { addMetadata } from '@/features/data/library'

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

  if (pageProps.songMetadata) {
    addMetadata(pageProps.songMetadata)
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <TooltipProvider>
        <Component {...pageProps} />
      </TooltipProvider>
    </>
  )
}

export default App
