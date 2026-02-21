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

export default function TimelineChart({ data, year }) {
  const [metric, setMetric] = useState("events") // "events" | "deaths"

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter(d => Number.isFinite(+d.year))
  }, [data])

  // Theme colors
  const stroke = metric === "events" ? THEME.accent : THEME.ink
  const fill = metric === "events" ? THEME.accent : THEME.ink
  const refStroke = metric === "events" ? THEME.accent : THEME.ink

  return (
    <div
      className="panel timeline"
      style={{ background: THEME.panel, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: 14 }}
    >
      <div className="panel-title-row">
        <div className="panel-title" style={{ color: THEME.ink, fontWeight: 600 }}>
          Global Timeline
        </div>

        <div className="toggle">
          <button
            className={metric === "events" ? "active" : ""}
            onClick={() => setMetric("events")}
            type="button"
            style={metric === "events" ? { outlineColor: THEME.accent } : undefined}
          >
            Events
          </button>
          <button
            className={metric === "deaths" ? "active" : ""}
            onClick={() => setMetric("deaths")}
            type="button"
            style={metric === "deaths" ? { outlineColor: THEME.ink } : undefined}
          >
            Deaths
          </button>
        </div>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={safeData} margin={{ top: 10, right: 12, left: 18, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={THEME.ink} strokeOpacity={0.12} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: THEME.ink }} tickMargin={8} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: THEME.ink }} width={56} />

            <Tooltip
              formatter={(value, name) => [
                Number(value).toLocaleString(),
                name === "events" ? "Events" : "Deaths"
              ]}
              labelFormatter={(label) => `Year: ${label}`}
            />

            {/* Highlight current year */}
            {Number.isFinite(+year) && (
              <ReferenceLine x={year} stroke={refStroke} strokeOpacity={0.65} strokeWidth={2}  />
            )}

            <Area
              type="monotone"
              dataKey={metric}
              stroke={stroke}
              strokeWidth={2}
              fill={fill}
              fillOpacity={0.22}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}