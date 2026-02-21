export function computeGlobalTimeline(rows) {
  const byYear = new Map()

  rows.forEach(d => {
    const year = +d.year
    if (!Number.isFinite(year)) return

    if (!byYear.has(year)) {
      byYear.set(year, { year, events: 0, deaths: 0 })
    }

    const obj = byYear.get(year)
    obj.events += +d.events_count || 0
    obj.deaths += +d.deaths_best || 0
  })

  return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
}