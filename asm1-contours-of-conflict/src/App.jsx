import { useState } from "react"
import MapDisplay from "./components/MapDisplay"
import PairedBars from "./components/PairedBars"
import { THEME, STOPS } from "./theme"
import SankeyChart from "./components/SankeyChart";
import CountryStackedArea from "./components/CountryStackedArea";
import CountryFocusSection from "./components/CountryFocusSection";

export default function App() {
  // Shared state (Hero section controls)
  const [year, setYear] = useState(2000)
  const [metric, setMetric] = useState("events_count")
  const [rows, setRows] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null);

  const legendFromStops = (stops) => {
  const out = []
  for (let i = 0; i < stops.length; i += 2) {
    out.push({ t: String(stops[i]), c: stops[i + 1] })
  }
  return out
  }
  return (
    <div className="w-full">
      {/* Section 1 — Hero */}
      <section id="hero" className="relative w-full h-screen">
        {/* Map */}
        <MapDisplay year={year} metric={metric} onDataLoaded={setRows} />

        {/* Title / Subtitle (optional placeholder) */}
        <div className="absolute left-4 top-4 z-10 rounded px-4 py-3 shadow"
             style={{ background: THEME.panel }}>
          <div className="text-xl font-semibold leading-tight">Contours of Conflict</div>
          <div className="text-xs text-gray-700">An atlas of a fractured century, 2000–2024</div>
        </div>

        {/* Control Panel(top-left) */}
        {/* Year Slider */}
        <div className="absolute top-24 left-4 z-10 bg-white/90 p-3 rounded shadow">
          <div className="text-sm font-semibold mb-2">Year: {year}</div>

          <input
            type="range"
            min="2000"
            max="2024"
            step="1"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-64"
            list="yearTicks"
            color="#E0B400"
          />

          <datalist id="yearTicks">
            {Array.from({ length: 6 }, (_, i) => 2000 + i * 5).map((y) => (
              <option key={y} value={y} label={String(y)} />
            ))}
            <option value={2024} label="2024" />
          </datalist>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setMetric("events_count")}
              className={`flex-1 rounded px-3 py-2 text-sm ${
                metric === "events_count" ? "bg-black text-white" : "bg-white border"
              }`}
            >
              Events
            </button>

            <button
              onClick={() => setMetric("fatality_rate")}
              className={`flex-1 rounded px-3 py-2 text-sm ${
                metric === "fatality_rate" ? "bg-black text-white" : "bg-white border"
              }`}
            >
              Fatality rate
            </button>
          </div>

          {/* Legend */}
          <div className="mt-3">
            <div className="text-xs font-semibold mb-2">
              Legend — {metric === "events_count" ? "Events" : "Fatality rate"}
            </div>

            <div className="space-y-1">
              {legendFromStops(STOPS[metric]).map((d, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block h-3 w-3 rounded-sm border"
                    style={{ background: d.c }}
                  />
                  <span className="text-gray-700">{d.t}</span>
                </div>
            ))}
            </div>
          </div>
        </div>

        {/* Mini nav (optional) */}
        <div className="absolute right-4 top-4 z-10 rounded bg-white/80 px-3 py-2 text-xs shadow">
          <a className="mr-3 hover:underline" href="#rankings">Rankings</a>
          <a className="mr-3 hover:underline" href="#sankey">Sankey</a>
          <a className="mr-3 hover:underline" href="#country">Country</a>
          <a className="hover:underline" href="#summary">Summary</a>
        </div>
      </section>

      {/* Section 2 — Rankings */}
      <section id="rankings" className="w-full bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold">Rankings</h2>
          <p className="mt-2 text-sm text-gray-600">
            Top countries by total events and deaths (2000–2024)
          </p>

          <PairedBars rows={rows} />

        </div>
      </section>

      {/* Section 3 — Sankey */}
      <section id="sankey" className="w-full bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold">Type of violence flows</h2>
          <p className="mt-2 text-sm text-gray-600">
            From state warfare to fragmented violence.
          </p>
          <p className="mt-2 text-sm text-gray-500">
          State warfare remains dominant, but violence fragments across regions.
          </p>

          <div className="mt-6 rounded-lg border bg-white p-6">
            <SankeyChart year={year} />
          </div>
        </div>
      </section>

      {/* Section 4 — Country focus */}
      <CountryFocusSection year={year} />

      {/* Section 5 — Summary + sources */}
      <section id="summary" className="w-full bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-semibold">Summary & sources</h2>
          <p className="mt-2 text-sm text-gray-600">
            Short rationale, awareness framing, data sources & references. (Placeholder)
          </p>

          <div className="mt-6 rounded-lg border bg-white p-6 text-sm text-gray-500">
            Summary + references go here.
          </div>
        </div>
      </section>
    </div>
  )
}