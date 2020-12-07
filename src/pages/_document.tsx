import * as React from 'react'

import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <link rel="icon" href="/favicon.ico" />
          {/* manifest.json provides metadata used when your web app is installed on a
      user's mobile device or desktop. See https://developers.google.com/web/fundamentals/web-app-manifest/ */}
          <link rel="manifest" href="/manifest.json" />
          {/* <!-- WebAudio Sounds --> */}
          {/* <!-- <script src="https://surikov.github.io/webaudiofont/npm/dist/WebAudioFontPlayer.js"></script>
    <script src="https://surikov.github.io/webaudiofontdata/sound/0000_JCLive_sf2_file.js"></script> -->*/}
          <script src="/soundfont/WebAudioFontPlayer.js"></script>
          <script src="/soundfont/0000_JCLive_sf2_file.js"></script>

          {/* <!-- Font Awesome --> */}
          <script
            async
            src="https://kit.fontawesome.com/c4e11a9337.js"
            crossOrigin="anonymous"
          ></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
