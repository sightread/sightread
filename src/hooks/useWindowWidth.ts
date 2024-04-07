import { breakpoints } from '@/utils'
import { useEffect, useState } from 'react'

export default function useWindowWidth(): number {
  const [windowWidth, setWindowWidth] = useState<number>(breakpoints.md)
  useEffect(() => {
    const width = window.innerWidth
    setWindowWidth(width)
    const resizeHandler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', resizeHandler)
    return function cleanup() {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [])

  return windowWidth
}
