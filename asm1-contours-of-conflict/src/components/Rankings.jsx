import { useMemo, useState } from "react"
import { computeCountryTotals, topNBy } from "../utils/ranking"

function fmt(n) {
  return new Intl.NumberFormat().format(n || 0)
}

export default function Rankings({ rows }) {
  const [mode, setMode] = useState("deaths") // "deaths" | "events"

  const totals = useMemo(() => computeCountryTotals(rows), [rows])

  const top = useMemo(() => {
    if (mode === "events") return topNBy(totals, "total_events", 10)
    return topNBy(totals, "total_deaths", 10)
  }, [totals, mode])

  return (
    <div className="mt-6 rounded-lg border bg-white p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {rows?.length ? `Countries: ${new Set(rows.map(r => r.iso3)).size}` : "Loading…"}
        </div>

        <div className="flex gap-2">
          <button
            className={`rounded px-3 py-2 text-sm ${mode === "events" ? "bg-black text-white" : "border"}`}
            onClick={() => setMode("events")}
          >
            Events
          </button>
          <button
            className={`rounded px-3 py-2 text-sm ${mode === "deaths" ? "bg-black text-white" : "border"}`}
            onClick={() => setMode("deaths")}
          >
            Deaths
          </button>
        </div>
      </div>

      <div className="mt-4 divide-y">
        {top.map((d, i) => (
          <div key={d.iso3} className="flex items-center justify-between py-3 text-sm">
            <div className="flex items-baseline gap-3">
              <div className="w-6 text-gray-500">{i + 1}</div>
              <div className="font-medium">{d.country}</div>
              <div className="text-xs text-gray-500">{d.iso3}</div>
            </div>

            <div className="font-semibold">
              {mode === "events" ? fmt(d.total_events) : fmt(d.total_deaths)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}