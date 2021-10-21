import * as React from 'react'
import '@/styles/reset.css'
import '@/styles/index.css'
import '@/styles/SelectSong.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="sightread" />
        <title>Sightread</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
