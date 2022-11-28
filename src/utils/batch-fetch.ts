export type ResponseHandler<T> = (response: Response) => Promise<T>

let cache: Map<string, Promise<any>>
export function batchedFetch<T>(url: string, handler: ResponseHandler<T>): Promise<T> {
  if (!cache) {
    cache = new Map()
  }

  const cachedPromise = cache.get(url)
  if (cachedPromise) {
    return cachedPromise
  }

  const fetchPromise = fetch(url).then(handler)
  cache.set(url, fetchPromise)
  fetchPromise.catch((e) => {
    console.error(`Error while attempting to fetch: ${url}:\n`, e)
    cache.delete(url)
  })
  return fetchPromise
}

export function syncFetch<T>(url: string): T {
  return cache.get(url) as T
}
