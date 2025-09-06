import '@/styles/global.css'
import { GA_TRACKING_ID } from '@/features/analytics'
import { PropsWithChildren } from 'react'
import { Outlet, Scripts, ScrollRestoration } from "react-router";
import { Providers } from './providers';

// TODO: maybe implement routeChangeComplete events in app router
// React.useEffect(() => {
//   const handleRouteChange = (url: string) => analytics.pageview(url)
//   router.events.on('routeChangeComplete', handleRouteChange)
//   return () => {
//     router.events.off('routeChangeComplete', handleRouteChange)
//   }
// }, [router.events])

//TODO: make inter the default font. figure out how to include it prperly in a react-router app

// export default function RootLayout({ children }: PropsWithChildren<{}>) {
//   return (
//     <html lang="en">
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//
//         <meta name="author" content="Jake Fried" />
//         <meta name="description" content="🎹 Learn to play piano with sightread" />
//
//         <link rel="icon" href="/favicon.ico" />
//         <link rel="apple-touch-icon" href="/favicon.ico" />
//
//         {/* Global Site Tag (gtag.js) - Google Analytics */}
//         <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
//         <script
//           dangerouslySetInnerHTML={{
//             __html: `
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', '${GA_TRACKING_ID}', {
//               page_path: window.location.pathname,
//             });`,
//           }}
//         />
//       </head>
//       <body>
//         {children}
//       </body>
//     </html>
//   )
// }

export function Layout({ children }: { children: React.ReactNode }) {
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
        <meta property="og:image" content="/images/mode_falling_notes_screenshot.png" />
        <meta property="og:image:alt" content="Sightread demo displaying falling notes visualization" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sightread.dev/images/mode_falling_notes_screenshot.png" />
        <meta name="twitter:image:alt" content="Sightread demo displaying falling notes visualization" />

        {/* Favicons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  )
}
