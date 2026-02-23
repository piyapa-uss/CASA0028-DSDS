import { useState } from "react"
import IntroSection from "./components/IntroSection"
import MapDisplay from "./components/MapDisplay"
import PairedBars from "./components/PairedBars"
import { THEME, STOPS } from "./theme"
import SankeyChart from "./components/SankeyChart"
import CountryFocusSection from "./components/CountryFocusSection"
import EndingSection from "./components/EndingSection"

const Section = ({ id, bg = "white", title, subtitle, children }) => {
  const bgClass = bg === "muted" ? "bg-gray-50" : "bg-white"
  return (
    <section id={id} className={`w-full ${bgClass} px-6 py-16`}>
      <div className="mx-auto max-w-6xl">
        {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
        {subtitle && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-600">
            {subtitle}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </section>
  )
}

export default function App() {
  // Hero shared state (map + timeline)
  const [year, setYear] = useState(2000)
  const [metric, setMetric] = useState("events_count")
  const [rows, setRows] = useState([])
  const [showTimeline, setShowTimeline] = useState(false)

  const legendFromStops = (stops) => {
    const out = []
    for (let i = 0; i < stops.length; i += 2) out.push({ t: String(stops[i]), c: stops[i + 1] })
    return out
  }

  return (
    <div className="w-full">
      {/* Intro */}
      <IntroSection />

      {/* Section 1 — Hero */}
      <section id="hero" className="relative w-full h-screen bg-white">
        {/* Map + optional timeline */}
        <MapDisplay
          year={year}
          metric={metric}
          onDataLoaded={setRows}
          showTimeline={showTimeline}
        />

        {/* Left panels wrapper */}
        <div className="absolute left-4 top-4 z-10 flex w-[320px] sm:w-[320px] flex-col gap-4">
          {/* Hero card */}
          <div className="rounded-xl border bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
            <div className="text-lg font-semibold leading-tight text-gray-900">
              Geopolitical shifts, mapped
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">
              The map shows where conflict concentrates each year, while the timeline tracks how
              intensity rises and falls across the period.
            </p>
          </div>

          {/* Controls */}
          <div className="rounded-xl border bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">Year: {year}</div>
              <button
                className="rounded border bg-white px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTimeline((v) => !v)}
                type="button"
              >
                {showTimeline ? "Hide timeline" : "Show timeline"}
              </button>
            </div>

            <input
              className="rankings-range mt-3 w-full"
              type="range"
              min="2000"
              max="2024"
              step="1"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />

            <div className="mt-2 flex justify-between text-[10px] text-gray-400">
              <span>2000</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><span>2024</span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setMetric("events_count")}
                className={`flex-1 rounded px-3 py-2 text-xs ${
                  metric === "events_count" ? "bg-black text-white" : "border bg-white"
                }`}
              >
                Events
              </button>

              <button
                onClick={() => setMetric("fatality_rate")}
                className={`flex-1 rounded px-3 py-2 text-xs ${
                  metric === "fatality_rate" ? "bg-black text-white" : "border bg-white"
                }`}
              >
                Fatality rate
              </button>
            </div>

            {/* Legend */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-700">
                Legend — {metric === "events_count" ? "Events" : "Fatality rate"}
              </div>

              <div className="mt-2 space-y-1">
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
        </div>

        {/* Mini nav */}
        <div className="absolute right-4 top-4 z-10 rounded-lg border bg-white/80 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <a className="mr-3 hover:underline" href="#sankey">Sankey</a>
          <a className="mr-3 hover:underline" href="#country">Country</a>
          <a className="mr-3 hover:underline" href="#rankings">Rankings</a>
          <a className="hover:underline" href="#summary">Summary</a>
        </div>
      </section>

      {/* Section 2 — Sankey */}
      <Section
        id="sankey"
        bg="muted"
        title="Type of violence flows"
        subtitle="Across regions, state-based conflict remains dominant, but the balance between state, non-state, and one-sided violence varies by geography."
      >
        <div className="rounded-xl border bg-white p-6">
          {/* Make Sankey standalone inside itself later (dropdown year) */}
          <SankeyChart year={year} />
        </div>
      </Section>

      {/* Section 3 — Country focus */}
      <Section
        id="country"
        bg="white"
        title="Country focus"
        subtitle="Country profiles reveal distinct trajectories rather than a single global pattern."
      >
        <CountryFocusSection year={year} />
      </Section>

      {/* Section 4 — Rankings */}
      <Section
        id="rankings"
        bg="muted"
        title="Rankings"
        subtitle="Rankings separate frequency from severity: some countries record many events with lower lethality, while others see fewer events but far higher death tolls."
      >
        <PairedBars rows={rows} />
      </Section>

      {/* Section 5 — Summary + sources */}
      <EndingSection />
    </div>
  )
}