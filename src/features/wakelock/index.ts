import { isBrowser } from '@/utils'

let wakeLock: null | { release: () => void } = null

function supportsWakeLock() {
  return isBrowser() && (navigator as any).wakeLock
}

export async function lock() {
  if (!supportsWakeLock()) {
    return
  }

  try {
    wakeLock = await Promise.resolve((navigator as any)?.wakeLock.request())
  } catch (e) {
    console.error(e)
  }
}
export function unlock() {
  if (!wakeLock) {
    return
  }
  wakeLock?.release()
  wakeLock = null
}

function handleVisibilityChange() {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    lock()
  }
}

if (supportsWakeLock()) {
  document.addEventListener('visibilitychange', handleVisibilityChange)
}
