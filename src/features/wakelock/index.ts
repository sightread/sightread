import { isBrowser } from '../../utils'

let wakeLock: null | { release: () => void } = null

export async function lock() {
  if (!isBrowser()) {
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

if (isBrowser()) {
  document.addEventListener('visibilitychange', handleVisibilityChange)
}
