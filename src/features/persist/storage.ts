import { isBrowser } from '@/utils'

/**
 * Wraps `LocalStorage` with a few builtin features:
 * - in-mem lookup for faster successive reads and semi-functional behaviore in no-storage scenarios.
 * - JSON parse/stringify for reduced boilerplate
 * - Error swallowing to not crash app
 */
export default class LocalStorageWrapper {
  static cache = new Map()

  static set<T>(key: string, value: T) {
    if (!isBrowser()) {
      return
    }
    // Important that we set the in-mem cache first, so even if persistent storage fails
    // it is still usable within the same session.
    this.cache.set(key, value)

    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(e)
    }
  }

  static has(key: string) {
    LocalStorageWrapper.get(key)
    return this.cache.get(key) != null
  }

  static get<T>(key: string | null): T | null {
    if (!isBrowser() || key === null) {
      return null
    }

    if (this.cache.has(key)) {
      return this.cache.get(key) as T
    }

    let val = null
    try {
      val = JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
    } catch {}
    this.cache.set(key, val)
    return val
  }

  static delete(key: string) {
    this.cache.delete(key)
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(e)
    }
  }
}
