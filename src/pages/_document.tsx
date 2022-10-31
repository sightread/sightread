import * as React from 'react'

import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { GA_TRACKING_ID } from '@/features/analytics'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8" />

          <meta name="author" content="Jake Fried" />
          <meta name="description" content="🎹 Learn to play piano with sightread" />

          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/favicon.ico" />

          <meta property="og:title" content="Sightread" />
          <meta property="og:description" content="🎹 Free app for learning to play Piano" />
          <meta property="og:image" content="images/mode_falling_notes_screenshot.png" />
          <meta property="og:url" content="https://sightread.dev" />
          <meta property="og:site_name" content="Sightread" />
          <meta name="twitter:card" content="images/mode_falling_notes_screenshot.png" />
          <meta
            name="twitter:image:alt"
            content="Sightread demo displaying falling notes visualization"
          />

          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });`,
            }}
          />
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
