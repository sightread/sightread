import { useEffect } from 'react'

type Destructor = () => void

export default function useOnUnmount(fn: Destructor) {
  return useEffect(() => fn, [])
}
