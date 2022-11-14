if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_GA_ID) {
  throw new Error('Missing NEXT_PUBLIC_GA_ID')
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }: any) => {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}
