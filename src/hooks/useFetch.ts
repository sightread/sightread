import { useEffect, useState } from 'react'

export default function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>()
  const [error, setError] = useState<Error | null>()

  useEffect(() => {
    setData(null)
    setError(null)
    fetch(url)
      .then((r) => r.json().then(setData))
      .catch(setError)
  }, [url])

  return { error, data, isLoading: error === null && data === null }
}
