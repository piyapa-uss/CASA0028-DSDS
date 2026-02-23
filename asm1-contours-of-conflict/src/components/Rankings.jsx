import { useMemo, useState } from "react"
import { computeCountryTotals, computeYearTotals, topNBy } from "../utils/ranking"

function fmt(n) {
  return new Intl.NumberFormat().format(n || 0)
}

export default function Rankings({ rows }) {
  const [scope, setScope] = useState("total") // "total" | "year"
  const [year, setYear] = useState(2024)

  const totals = useMemo(() => {
    return scope === "total"
      ? computeCountryTotals(rows)
      : computeYearTotals(rows, year)
  }, [rows, scope, year])

  const topEvents = useMemo(
    () => topNBy(totals, "total_events", 10),
    [totals]
  )

  const topDeaths = useMemo(
    () => topNBy(totals, "total_deaths", 10),
    [totals]
  )

  return (
    <div className="mt-6 rounded-lg border bg-white p-6">ฃ
      <div className="mb-2 rounded bg-red-100 p-2 text-xs font-semibold text-red-700">
      DEBUG: NEW Rankings.jsx is rendering
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          {rows?.length ? `Countries: ${new Set(rows.map(r => r.iso3)).size}` : "Loading…"}
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>
      
      <div className="mt-2 text-xs text-gray-400">scope: {scope}</div>

      {/* Year Slider */}
      {scope === "year" && (
        <div className="mt-4 rounded border bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Year: {year}</div>
            <div className="text-xs text-gray-500">2000–2024</div>
          </div>

          <input
            className="mt-2 w-full"
            type="range"
            min="2000"
            max="2024"
            step="1"
            value={year}
            onChange={(e) => setYear(+e.target.value)}
          />
        </div>
      )}

      <div className="mt-4 divide-y">
        {topEvents.map((d, i) => (
          <div key={d.iso3} className="flex items-center justify-between py-3 text-sm">
            <div className="flex items-baseline gap-3">
              <div className="w-6 text-gray-500">{i + 1}</div>
              <div className="font-medium">{d.country}</div>
              <div className="text-xs text-gray-500">{d.iso3}</div>
            </div>

            <div className="font-semibold">{fmt(d.total_events)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}