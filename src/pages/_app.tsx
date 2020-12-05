import * as React from 'react'
import '../styles/reset.css'
import '../styles/index.css'
import '../styles/SelectSong.css'
import { PlayerProvider, SongPressedKeysProvider, UserPressedKeysProvider } from '../hooks/index'
import type { AppProps } from 'next/app'
import Head from 'next/head'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="sightread" />
        {/* manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/ */}
        <link rel="manifest" href="/manifest.json" />
        <title>sightread</title>
        {/* <!-- WebAudio Sounds --> */}
        {/* <!-- <script src="https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js"></script>
    <script src="https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js"></script> -->*/}
        <script src="/soundfont/WebAudioFontPlayer.js"></script>
        <script src="/soundfont/0000_JCLive_sf2_file.js"></script>

        {/* <!-- Font Awesome --> */}
        <div
          dangerouslySetInnerHTML={{
            __html: ` <script async src="https://kit.fontawesome.com/c4e11a9337.js" crossOrigin="anonymous" ></script>`,
          }}
        />
      </Head>
      <UserPressedKeysProvider>
        <SongPressedKeysProvider>
          <PlayerProvider>
            <Component {...pageProps} />
          </PlayerProvider>
        </SongPressedKeysProvider>
      </UserPressedKeysProvider>
    </>
  )
}

export default MyApp
