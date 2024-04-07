import * as wakelock from '@/features/wakelock'
import { useEffect } from 'react'

export default function useWakeLock() {
  useEffect(() => {
    wakelock.lock()
    return () => wakelock.unlock()
  }, [])
}
