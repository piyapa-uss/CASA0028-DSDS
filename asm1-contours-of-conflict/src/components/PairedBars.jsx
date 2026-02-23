import { useMemo, useState } from "react"
import { computeRankings } from "../utils/ranking"
import { THEME } from "../theme"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

const fmt = (x) => (x ?? 0).toLocaleString()

function MiniTooltip({ active, payload, label, getLabel }) {
  if (!active || !payload?.length) return null
  const value = payload[0].value

  return (
    <div className="rounded-md border bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
      <div className="font-medium text-gray-900">{getLabel?.(label) ?? label}</div>
      <div className="mt-1 text-gray-600 tabular-nums">{fmt(value)}</div>
    </div>
  )
}

export default function PairedBars({ rows }) {
  const [scope, setScope] = useState("total")
  const [year, setYear] = useState(2024)

  const { topEvents, topDeaths } = useMemo(
    () => computeRankings(rows, scope, year, 10),
    [rows, scope, year]
  )

  const rangeLabel = scope === "total" ? "2000–2024" : String(year)

  // Prepare data for chart
  const eventsChartData = useMemo(
    () =>
      topEvents.map((d) => ({
        iso: d.iso,
        country: d.name,
        value: d.events
      })),
    [topEvents]
  )

  const deathsChartData = useMemo(
    () =>
      topDeaths.map((d) => ({
        iso: d.iso,
        country: d.name,
        value: d.deaths
      })),
    [topDeaths]
  )

  // Unified series colors (make sure THEME.series exists in theme.js)
  const EVENTS_COLOR = THEME.series?.events ?? THEME.neutral
  const DEATHS_COLOR = THEME.series?.deaths ?? THEME.core

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="mt-1 text-lg font-semibold">Events vs Deaths</div>
          <div className="mt-1 text-xs text-gray-500">
            Rankings reflect cumulative total impacts.({rangeLabel}).
          </div>
        </div>

        {/* legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: EVENTS_COLOR }} />
            Events
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: DEATHS_COLOR }} />
            Deaths
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          className={`rounded px-3 py-2 text-sm ${
            scope === "total" ? "bg-black text-white" : "border"
          }`}
          onClick={() => setScope("total")}
        >
          Total (2000–2024)
        </button>

        <button
          className={`rounded px-3 py-2 text-sm ${
            scope === "year" ? "bg-black text-white" : "border"
          }`}
          onClick={() => setScope("year")}
        >
          Single year
        </button>

        {/* Year Slider */}
        {scope === "year" && (
          <div className="ml-3 flex items-center gap-3 rounded border bg-gray-50 px-3 py-2">
            <div className="text-sm font-medium">Year: {year}</div>
            <input
              className="rankings-range"
              type="range"
              min="2000"
              max="2024"
              step="1"
              value={year}
              onChange={(e) => setYear(+e.target.value)}
              list="yearTicks"
            />
            <datalist id="yearTicks">
              {Array.from({ length: 6 }, (_, i) => 2000 + i * 5).map((y) => (
                <option key={y} value={y} label={String(y)} />
              ))}
              <option value={2024} label="2024" />
            </datalist>
          </div>
        )}
      </div>

      {/* Double Charts */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Left: Events */}
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold">Top 10 by events ({rangeLabel})</div>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsChartData}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="iso"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  width={44}
                />
                <Tooltip
                  content={
                    <MiniTooltip
                      getLabel={(iso) => {
                        const row = eventsChartData.find((d) => d.iso === iso)
                        return row ? `${row.country} (${iso})` : iso
                      }}
                    />
                  }
                />
                <Bar dataKey="value" fill={EVENTS_COLOR} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Deaths */}
        <div className="rounded-lg border bg-white p-4">
          <div className="text-sm font-semibold">Top 10 by deaths ({rangeLabel})</div>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deathsChartData}>
                <CartesianGrid vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="iso"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                />
                <YAxis
                  tickFormatter={fmt}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  tickLine={false}
                  axisLine={{ stroke: "#E5E7EB" }}
                  width={44}
                />
                <Tooltip
                  content={
                    <MiniTooltip
                      getLabel={(iso) => {
                        const row = deathsChartData.find((d) => d.iso === iso)
                        return row ? `${row.country} (${iso})` : iso
                      }}
                    />
                  }
                />
                <Bar dataKey="value" fill={DEATHS_COLOR} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        Frequency and lethality do not always move together. Some countries record
        high numbers of events with comparatively lower fatality rates, while others
        experience fewer incidents but far greater human cost. The contrast highlights
        how intensity and scale shape different conflict profiles.
      </p>
    </div>
  )
}