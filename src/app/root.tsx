import { GA_TRACKING_ID } from '@/features/analytics'
import styles from '@/styles/global.css?inline'
import { Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Providers } from './providers'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Sightread</title>
        <meta name="author" content="Jake Fried" />
        <meta name="description" content="app for learning piano" />

        {/* Preloads */}
        <link rel="preload" as="font" type="font/woff2" href="/fonts/inter/InterVariable.woff2" />

        {/* Open Graph */}
        <meta property="og:title" content="Sightread" />
        <meta property="og:site_name" content="Sightread" />
        <meta property="og:description" content="app for learning piano" />
        <meta property="og:image" content="/images/mode_falling_notes_screenshot.png" />
        <meta
          property="og:image:alt"
          content="Sightread demo displaying falling notes visualization"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://sightread.dev/images/mode_falling_notes_screenshot.png"
        />
        <meta
          name="twitter:image:alt"
          content="Sightread demo displaying falling notes visualization"
        />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />

        {/* Global Site Tag (gtag.js) - Google Analytics */}
        <script defer src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
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

        {/* Manually inserted styles */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  )
}
