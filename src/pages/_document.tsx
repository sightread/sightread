import * as React from 'react'

import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { extractCss } from '../flakecss'

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
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Titillium+Web&display=block"
            rel="stylesheet"
          />
          {/* <!-- Font Awesome --> */}
          <script async src="https://kit.fontawesome.com/c4e11a9337.js" crossOrigin="anonymous" />
          <style id="FLAKE_CSS" dangerouslySetInnerHTML={{ __html: extractCss() }} />
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
