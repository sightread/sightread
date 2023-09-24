/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

interface Window {
  gtag: (event: string, action: string, object: any) => void
}
