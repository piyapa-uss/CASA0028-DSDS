import { useMemo } from "react"
import { topByEvents } from "../utils/ranking"
import { THEME } from "../theme"

const fmt = (x) => (x ?? 0).toLocaleString()

export default function PairedBars({ rows }) {
  const data = useMemo(() => topByEvents(rows, 10), [rows])

  const maxEvents = Math.max(1, ...data.map((d) => d.events))
  const maxDeaths = Math.max(1, ...data.map((d) => d.deaths))

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="text-sm text-gray-600">Top 10 by events (2000–2024)</div>
          <div className="mt-1 text-lg font-semibold">Events vs Deaths</div>
          <div className="mt-1 text-xs text-gray-500">
            Countries ranked by cumulative event counts, 2000–2024.
          </div>
        </div>

        {/* legend */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: THEME.accent }} />
            Events
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-sm" style={{ background: THEME.ink }} />
            Deaths
          </div>
        </div>
      </div>

      <div className="mt-6 divide-y">
        {data.map((d, i) => {
          const wEvents = (d.events / maxEvents) * 100
          const wDeaths = (d.deaths / maxDeaths) * 100

          return (
            <div key={d.iso} className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <div className="w-6 text-sm text-gray-500">{i + 1}</div>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.iso}</div>
                </div>

                <div className="w-32 text-right text-xs text-gray-500 tabular-nums">
                  <div>
                    Events:{" "}
                    <span className="font-semibold text-gray-900">{fmt(d.events)}</span>
                  </div>
                  <div>
                    Deaths:{" "}
                    <span className="font-semibold text-gray-900">{fmt(d.deaths)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {/* Events */}
                <div className="h-2 w-full rounded bg-gray-100">
                    <div
                    className="h-2 rounded"
                    style={{ background: THEME.accent, width: `${wEvents}%` }}
                    title={`Events: ${fmt(d.events)}`}
                    />
                </div>
                {/* Deaths */}
                <div className="h-2 w-full rounded bg-gray-100">
                    <div
                    className="h-2 rounded"
                    style={{ background: THEME.ink, width: `${wDeaths}%` }}
                    title={`Deaths: ${fmt(d.deaths)}`}
                    />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}