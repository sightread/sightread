import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

type QueryStringObject = { [key: string]: string | string[] }
export function useQueryString<T extends QueryStringObject>(initialState: T): [T, (t: T) => void] {
  const router = useRouter()
  const [queryObject, setQueryObject] = useState<T>(initialState)
  const isFirst = useRef(true)

  useEffect((): void => {
    // On first render, set the state to what is present in URL.
    // On future modifications to queryObject, update the URL.
    if (isFirst.current) {
      isFirst.current = false
      const urlState = parseUrlSearchParam(window.location.search) as T
      if (urlState) {
        setQueryObject(urlState)
      }
      return
    }
    router.replace(location.pathname + '?' + createUrlSearchParam(queryObject))
  }, [queryObject, router])

  return [queryObject, setQueryObject]
}

function parseUrlSearchParam<T extends QueryStringObject>(search: string): T | null {
  if (!search) {
    return null
  }

  const obj: any = {}
  const searchParam = new URLSearchParams(search)
  for (const [k, v] of searchParam.entries()) {
    obj[k] = v
  }
  return obj
}

function createUrlSearchParam(init: { [key: string]: string | string[] }): URLSearchParams {
  const arr: Array<[string, string]> = []
  for (const [key, value] of Object.entries(init)) {
    const valueArr = Array.isArray(value) ? value : [value]
    valueArr.forEach((v) => {
      arr.push([key, v])
    })
  }
  return new URLSearchParams(arr)
}

export default useQueryString
