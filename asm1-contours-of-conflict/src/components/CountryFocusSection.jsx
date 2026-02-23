import { useEffect, useMemo, useState } from "react"
import CountryStackedArea from "./CountryStackedArea"

export default function CountryFocusSection({ year }) {
  const [countryOptions, setCountryOptions] = useState([])
  const [countryId, setCountryId] = useState(null)

  // Load dropdown options from CSVs
  useEffect(() => {
    let cancelled = false

    Promise.all([
      fetch("/data/country_year_summary.csv").then((r) => r.text()),
      fetch("/data/country_year_type_share.csv").then((r) => r.text())
    ])
      .then(([summaryText, shareText]) => {
        if (cancelled) return

        // --- 1) build country -> iso3 map from summary ---
        const sLines = summaryText.trim().split("\n")
        const sHeader = sLines[0].split(",").map((h) => h.trim())
        const sIdx = Object.fromEntries(sHeader.map((h, i) => [h, i]))

        const iso3ByCountry = new Map()
        for (const line of sLines.slice(1)) {
          const c = line.split(",")
          const country = (c[sIdx.country] ?? "").trim()
          const iso3 = (c[sIdx.iso3] ?? "").trim()
          if (country && iso3 && !iso3ByCountry.has(country)) iso3ByCountry.set(country, iso3)
        }

        // --- 2) read unique country_id + country from type_share ---
        const lines = shareText.trim().split("\n")
        const header = lines[0].split(",").map((h) => h.trim())
        const idx = Object.fromEntries(header.map((h, i) => [h, i]))

        const seen = new Map()
        for (const line of lines.slice(1)) {
          const c = line.split(",")
          const id = Number(c[idx.country_id])
          if (Number.isNaN(id)) continue

          const name = (c[idx.country] ?? "Unknown").trim()
          if (!seen.has(id)) {
            seen.set(id, { id, name, iso3: iso3ByCountry.get(name) ?? "" })
          }
        }

        const list = Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name))
        setCountryOptions(list)
      })
      .catch(() => {
        if (!cancelled) setCountryOptions([])
      })

    return () => {
      cancelled = true
    }
  }, [])

  const selected = useMemo(() => {
    return countryOptions.find((d) => d.id === countryId) || null
  }, [countryOptions, countryId])

  return (
    <div className="w-full">
      {/* Controls row */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900">Select a country</div>
          <div className="mt-1 text-xs text-gray-500">
            Compare shifts in conflict types over time. Current year:{" "}
            <span className="font-medium text-gray-700">{year}</span>
          </div>
        </div>

        <div className="min-w-[260px]">
          <select
            className="w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-0"
            value={countryId ?? ""}
            onChange={(e) => setCountryId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Select a country…</option>
            {countryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.iso3 ? `(${c.iso3})` : ""}
              </option>
            ))}
          </select>

          {selected ? (
            <div className="mt-2 text-xs text-gray-500">
              Selected:{" "}
              <span className="font-medium text-gray-700">
                {selected.name} {selected.iso3 ? `(${selected.iso3})` : ""}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Chart card */}
      <div className="mt-6 rounded-xl border bg-white p-6">
        <CountryStackedArea countryId={countryId} year={year} />

        <p className="mt-4 max-w-3xl text-xs leading-relaxed text-gray-600">
          The stacked chart shows how the composition of violence types changes over time for the selected
          country, highlighting distinct national trajectories rather than a single global pattern.
        </p>
      </div>
    </div>
  )
}