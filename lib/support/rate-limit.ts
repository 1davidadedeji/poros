// Bounded, per-process protection. A multi-instance deployment also needs a shared edge limit.
const state = globalThis as typeof globalThis & { porosSupportLimits?: Map<string, { count: number; reset: number }> }
const buckets = state.porosSupportLimits ??= new Map()
export function allowSupportRequest(client: string, now = Date.now()) {
  for (const [key, bucket] of buckets) if (bucket.reset <= now) buckets.delete(key)
  const keys = [{ key: 'global', limit: 120 }, { key: `client:${client}`, limit: 15 }]
  if (keys.some(({ key, limit }) => (buckets.get(key)?.count ?? 0) >= limit)) return false
  if (buckets.size > 2000 && !buckets.has(`client:${client}`)) return false
  for (const { key } of keys) {
    const bucket = buckets.get(key) ?? { count: 0, reset: now + 60 * 60 * 1000 }
    bucket.count++; buckets.set(key, bucket)
  }
  return true
}
