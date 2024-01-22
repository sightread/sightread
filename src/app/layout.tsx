import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/global.css'
import { Providers } from './providers'
import { GA_TRACKING_ID } from '@/features/analytics'

// TODO: maybe implement routeChangeComplete events in app router
// React.useEffect(() => {
//   const handleRouteChange = (url: string) => analytics.pageview(url)
//   router.events.on('routeChangeComplete', handleRouteChange)
//   return () => {
//     router.events.off('routeChangeComplete', handleRouteChange)
//   }
// }, [router.events])

// TODO: get chatgpt to help here.
const fallingNotesScreenshot = {
  url: 'images/mode_falling_notes_screenshot.png',
  alt: 'Sightread demo displaying falling notes visualization',
}
export const metadata: Metadata = {
  title: 'sightread',
  description: 'app for learning piano',
  openGraph: {
    title: 'sightread',
    siteName: 'Sightread',
    description: 'app for learning piano',
    images: [fallingNotesScreenshot],
  },
  twitter: {
    images: [fallingNotesScreenshot],
  },
  metadataBase: new URL('https://sightread.dev'),
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--primary-font-family',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta name="author" content="Jake Fried" />
        <meta name="description" content="🎹 Learn to play piano with sightread" />

        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

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
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
