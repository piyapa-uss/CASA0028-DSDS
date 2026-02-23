import { useMemo, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts"
import { THEME } from "../theme"

const fmt = (x) => (Number.isFinite(+x) ? Number(x).toLocaleString() : "0")

function MiniTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null

  const v = payload[0]?.value
  const labelText = metric === "events" ? "Events" : "Fatalities"

  return (
    <div className="pointer-events-none rounded-lg border bg-white/90 px-3 py-2 text-[11px] leading-snug shadow-sm backdrop-blur">
      <div className="font-medium text-gray-900">Year {label}</div>
      <div className="mt-1 text-gray-600 tabular-nums">
        {labelText}: <span className="font-semibold text-gray-900">{fmt(v)}</span>
      </div>
    </div>
  )
}

export default function TimelineChart({ data, year }) {
  const [metric, setMetric] = useState("events") // "events" | "deaths"

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((d) => Number.isFinite(+d.year))
  }, [data])

  const stroke = metric === "events" ? THEME.accent : THEME.ink
  const fill = metric === "events" ? THEME.accent : THEME.ink

  return (
    <div className="rounded-xl border border-white/30 bg-transparent p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm font-semibold text-gray-900">Global timeline</div>

        <div className="flex gap-2">
          <button
            className={`rounded px-2 py-1 text-xs ${
              metric === "events" ? "bg-black text-white" : "border bg-white"
            }`}
            onClick={() => setMetric("events")}
            type="button"
          >
            Events
          </button>
          <button
            className={`rounded px-2 py-1 text-xs ${
              metric === "deaths" ? "bg-black text-white" : "border bg-white"
            }`}
            onClick={() => setMetric("deaths")}
            type="button"
          >
            Fatalities
          </button>
        </div>
      </div>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 12, left: 12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
              width={46}
              tickFormatter={fmt}
            />

            {/* Hoover Tooltip */}
            <Tooltip content={<MiniTooltip metric={metric} />} />

            {Number.isFinite(+year) && (
              <ReferenceLine x={year} stroke={stroke} strokeOpacity={0.65} strokeWidth={2} />
            )}

            <Area
              type="monotone"
              dataKey={metric}
              stroke={stroke}
              strokeWidth={2}
              fill={fill}
              fillOpacity={0.18}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}