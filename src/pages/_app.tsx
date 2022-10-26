import * as React from 'react'
import '@/styles/global.css'
import '@/styles/index.css'
import '@/styles/SelectSong.css'
import '@/styles/Tooltip.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as analytics from '@/features/analytics'
import Head from 'next/head'
import { Inter } from '@next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--primary-font-family',
})

function App({ Component, pageProps }: AppProps) {
  const router = useRouter()
  useEffect(() => {
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
        <title>sightread</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default App
