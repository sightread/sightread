import * as React from 'react'
import '@/styles/reset.css'
import '@/styles/index.css'
import '@/styles/SelectSong.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as analytics from '@/features/analytics'

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
      <Component {...pageProps} />
    </>
  )
}

export default App
