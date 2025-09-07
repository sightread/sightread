if (import.meta.env.PROD && !import.meta.env.VITE_PUBLIC_GA_ID) {
  throw new Error('Missing VITE_PUBLIC_GA_ID')
}

export const GA_TRACKING_ID = import.meta.env.VITE_PUBLIC_GA_ID ?? ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (!import.meta.env.PROD) {
    return
  }
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: any) => {
  if (!import.meta.env.PROD) {
    return
  }
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
