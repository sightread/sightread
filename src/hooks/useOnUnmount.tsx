import { useEffect, useRef } from 'react'

type Destructor = () => void

export default function useOnUnmount(fn: Destructor) {
  const unmountFnRef = useRef<Destructor>(null)
  unmountFnRef.current = fn
  return useEffect(() => () => unmountFnRef.current?.(), [])
}
