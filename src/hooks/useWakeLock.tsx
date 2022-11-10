import { useEffect } from 'react'
import * as wakelock from '@/features/wakelock'

export default function useWakeLock() {
  useEffect(() => {
    wakelock.lock()
    return () => wakelock.unlock()
  }, [])
}
