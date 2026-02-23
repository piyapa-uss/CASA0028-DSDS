import { useEffect, useMemo, useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from "recharts"

const TYPE_LABEL = {
  1: "State-based",
  2: "Non-state",
  3: "One-sided"
}

const TYPE_COLOR = {
  1: "#1F2937", // State-based (ink)
  2: "#6B7280", // Non-state (slate)
  3: "#B38A4C", // One-sided (muted gold)
}

// Minimal CSV parser (works for simple CSV without tricky quoted commas)
function parseCSV(text) {
  const lines = text.trim().split("\n")
  if (lines.length <= 1) return []
  const header = lines[0].split(",").map((h) => h.trim())
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))

  const rows = []
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue
    const c = line.split(",")
    rows.push({
      country: c[idx.country] ?? "",
      country_id: Number(c[idx.country_id]),
      year: Number(c[idx.year]),
      type_of_violence: Number(c[idx.type_of_violence]),
      share: Number(c[idx.share])
    })
  }
  return rows
}

const pct = (v) => `${Math.round(Number(v) * 100)}%`

function MiniTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  // payload order is stacked; show all three in a tidy list
  const items = payload
    .slice()
    .reverse()
    .filter((p) => Number.isFinite(+p.value))

  return (
    <div className="rounded-md border bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
      <div className="font-medium text-gray-900">Year {label}</div>
      <div className="mt-1 space-y-1">
        {items.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
              <span>{p.name}</span>
            </div>
            <div className="tabular-nums font-semibold text-gray-900">{pct(p.value)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function CountryStackedArea({ countryId, year }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  // Load once
  useEffect(() => {
    let cancelled = false

    fetch("/data/country_year_type_share.csv")
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return
        const parsed = parseCSV(text).filter(
          (d) =>
            Number.isFinite(d.country_id) &&
            Number.isFinite(d.year) &&
            Number.isFinite(d.type_of_violence) &&
            Number.isFinite(d.share)
        )
        setRows(parsed)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setRows([])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const chartData = useMemo(() => {
    if (!countryId) return []

    const MIN_YEAR = 2000
    const MAX_YEAR = 2024

    const filtered = rows.filter(
      (d) =>
        d.country_id === countryId &&
        d.year >= MIN_YEAR &&
        d.year <= MAX_YEAR &&
        (d.type_of_violence === 1 || d.type_of_violence === 2 || d.type_of_violence === 3)
    )

    const byYear = new Map()
    for (const d of filtered) {
      if (!byYear.has(d.year)) byYear.set(d.year, { year: d.year, t1: 0, t2: 0, t3: 0 })
      const obj = byYear.get(d.year)
      if (d.type_of_violence === 1) obj.t1 = d.share
      if (d.type_of_violence === 2) obj.t2 = d.share
      if (d.type_of_violence === 3) obj.t3 = d.share
    }

    return Array.from(byYear.values()).sort((a, b) => a.year - b.year)
  }, [rows, countryId])

  if (!countryId) return <div className="text-sm text-gray-500">Select a country</div>
  if (loading) return <div className="text-sm text-gray-500">Loading...</div>
  if (!chartData.length) {
    return <div className="text-sm text-gray-500">No data for this country (2000–2024).</div>
  }

  return (
    // focus:outline-none + select-none helps kill the “blue focus rectangle” feel
    <div className="h-[340px] w-full select-none focus:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickMargin={8}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 1]}
            tickFormatter={(v) => `${Math.round(v * 100)}%`}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            width={44}
          />

          <Tooltip content={<MiniTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: 11, color: "#6B7280" }}
            iconType="square"
          />

          {Number.isFinite(+year) ? (
            <ReferenceLine x={year} stroke="#111827" strokeOpacity={0.35} strokeDasharray="4 3" />
          ) : null}

          <Area
            type="monotone"
            dataKey="t1"
            name={TYPE_LABEL[1]}
            stackId="1"
            stroke={TYPE_COLOR[1]}
            fill={TYPE_COLOR[1]}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t2"
            name={TYPE_LABEL[2]}
            stackId="1"
            stroke={TYPE_COLOR[2]}
            fill={TYPE_COLOR[2]}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t3"
            name={TYPE_LABEL[3]}
            stackId="1"
            stroke={TYPE_COLOR[3]}
            fill={TYPE_COLOR[3]}
            fillOpacity={0.8}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}