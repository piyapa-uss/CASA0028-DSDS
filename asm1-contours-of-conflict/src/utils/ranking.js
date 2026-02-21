function toNumber(x) {
  const n = Number(x)
  return Number.isFinite(n) ? n : 0
}

export function topByEvents(rows, n = 10) {
  const byIso = new Map()

  for (const r of rows || []) {
    const iso = r.iso3_std || r.iso3 || r.iso || r.country_code
    const name = r.country || r.country_name || r.name
    if (!iso || !name) continue

    const events = toNumber(r.events_count ?? r.events ?? 0)
    const deaths = toNumber(
        r.deaths_best ??         
        r.deaths_count ??
        r.fatalities_count ??
        r.fatalities ??
        r.deaths ??
        0
)
    const cur = byIso.get(iso) || { iso, name, events: 0, deaths: 0 }
    cur.events += events
    cur.deaths += deaths
    byIso.set(iso, cur)
  }

  return Array.from(byIso.values())
    .sort((a, b) => b.events - a.events)
    .slice(0, n)
}

export function topNBy(totals, key, n = 10) {
  return [...(totals || [])]
    .sort((a, b) => (b[key] || 0) - (a[key] || 0))
    .slice(0, n)
}
