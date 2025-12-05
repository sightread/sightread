import { GA_TRACKING_ID } from '@/features/analytics'
import { assetUrl } from '@/utils/assets'
import styles from '@/styles/global.css?inline'
import { Outlet, Scripts, ScrollRestoration } from 'react-router'
import { Providers } from './providers'
import { GlobalModals } from '@/features/modals/GlobalModals'

export function Layout({ children }: { children: React.ReactNode }) {
  const ogImageUrl = assetUrl('images/mode_falling_notes_screenshot.png')
  const faviconUrl = assetUrl('favicon.ico')

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <title>Sightread</title>
        <meta name="author" content="Jake Fried" />
        <meta name="description" content="app for learning piano" />

        {/* Open Graph */}
        <meta property="og:title" content="Sightread" />
        <meta property="og:site_name" content="Sightread" />
        <meta property="og:description" content="app for learning piano" />
        <meta property="og:image" content={ogImageUrl} />
        <meta
          property="og:image:alt"
          content="Sightread demo displaying falling notes visualization"
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          // Keep the public, absolute URL for social sharing
          content="https://sightread.dev/images/mode_falling_notes_screenshot.png"
        />
        <meta
          name="twitter:image:alt"
          content="Sightread demo displaying falling notes visualization"
        />

        {/* Favicons */}
        <link rel="icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />

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
      <GlobalModals />
    </Providers>
  )
}
