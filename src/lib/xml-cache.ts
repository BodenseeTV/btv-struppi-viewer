export interface XmlCacheEntry {
  xml: string
  fetchedAt: number
}

const SESSION_CACHE_KEY = "struppi-viewer:xml-cache:v1"
const LOCAL_CACHE_KEY = "struppi-viewer:xml-cache:backup:v1"
const DEFAULT_CACHE_TTL = 5 * 60 * 1000

function safeStorage(name: "session" | "local"): Storage | null {
  try {
    if (name === "session") {
      return window.sessionStorage
    }
    return window.localStorage
  } catch {
    return null
  }
}

export function normalizeXmlUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""

  try {
    if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || /^[a-z]+:/i.test(trimmed)) {
      return new URL(trimmed).toString()
    }

    if (trimmed.startsWith("/")) {
      const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "")
      const candidate = `${basePath}${trimmed}`
      return new URL(candidate, window.location.origin).toString()
    }

    return new URL(trimmed, window.location.href).toString()
  } catch {
    return trimmed
  }
}

export function readCachedXml(url: string): string | null {
  const normalized = normalizeXmlUrl(url)
  if (!normalized) return null

  const sessionStorageRef = safeStorage("session")
  const localStorageRef = safeStorage("local")

  for (const storage of [sessionStorageRef, localStorageRef]) {
    if (!storage) continue

    try {
      const parsed = JSON.parse(
        storage.getItem(
          storage === sessionStorageRef ? SESSION_CACHE_KEY : LOCAL_CACHE_KEY
        ) || "{}"
      ) as Record<string, XmlCacheEntry>
      const entry = parsed[normalized]
      if (!entry) continue

      const age = Date.now() - entry.fetchedAt
      if (age <= DEFAULT_CACHE_TTL) {
        return entry.xml
      }

      delete parsed[normalized]
      storage.setItem(
        storage === sessionStorageRef ? SESSION_CACHE_KEY : LOCAL_CACHE_KEY,
        JSON.stringify(parsed)
      )
    } catch {
      // Ignore malformed cache data
    }
  }

  return null
}

export function writeCachedXml(url: string, xml: string): void {
  const normalized = normalizeXmlUrl(url)
  if (!normalized) return

  const storage = safeStorage("session") ?? safeStorage("local")
  if (!storage) return

  const cacheKey =
    storage === safeStorage("session") ? SESSION_CACHE_KEY : LOCAL_CACHE_KEY

  try {
    const raw = storage.getItem(cacheKey) || "{}"
    const parsed = JSON.parse(raw) as Record<string, XmlCacheEntry>
    parsed[normalized] = {
      xml,
      fetchedAt: Date.now(),
    }
    storage.setItem(cacheKey, JSON.stringify(parsed))
  } catch {
    // Ignore malformed cache writes
  }
}

export function clearCachedXml(url?: string): void {
  const targets = [safeStorage("session"), safeStorage("local")].filter(
    Boolean
  ) as Storage[]

  for (const storage of targets) {
    try {
      const key =
        storage === safeStorage("session") ? SESSION_CACHE_KEY : LOCAL_CACHE_KEY
      const raw = storage.getItem(key) || "{}"
      const parsed = JSON.parse(raw) as Record<string, XmlCacheEntry>

      if (!url) {
        storage.removeItem(key)
        continue
      }

      const normalized = normalizeXmlUrl(url)
      if (normalized && parsed[normalized]) {
        delete parsed[normalized]
        storage.setItem(key, JSON.stringify(parsed))
      }
    } catch {
      // Ignore cache-clearing failures
    }
  }
}

export function getCacheSnapshot(): Record<string, XmlCacheEntry> {
  const snapshot: Record<string, XmlCacheEntry> = {}

  for (const storage of [safeStorage("session"), safeStorage("local")]) {
    if (!storage) continue

    const key =
      storage === safeStorage("session") ? SESSION_CACHE_KEY : LOCAL_CACHE_KEY
    try {
      const raw = storage.getItem(key)
      if (!raw) continue
      Object.assign(snapshot, JSON.parse(raw) as Record<string, XmlCacheEntry>)
    } catch {
      // Skip malformed cache entries
    }
  }

  return snapshot
}
