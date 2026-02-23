import { useEffect, useRef, useState } from "react"
import maplibregl from "maplibre-gl"
import Papa from "papaparse"
import "maplibre-gl/dist/maplibre-gl.css"
import { computeGlobalTimeline } from "../utils/timeline"
import TimelineChart from "./TimelineChart"
import { THEME, STOPS } from "../theme"
import { withBase } from "../utils/paths"

export default function MapDisplay({ year, metric, onDataLoaded, showTimeline }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  const [hoverInfo, setHoverInfo] = useState(null)

  const countriesRef = useRef(null)
  const rowsRef = useRef(null)
  const loadedRef = useRef(false)

  const hoveredIso3Ref = useRef(null)

  // --- SAFETY HELPERS (prevents "undefined found" in MapLibre paint props) ---
  const safeColor = (c, fallback) => (typeof c === "string" && c.trim() ? c : fallback)

  const safeMetric = metric === "fatality_rate" ? "fatality_rate" : "events_count"
  const metricLabel = safeMetric === "events_count" ? "Events" : "Fatality rate"

  const safeStops =
    Array.isArray(STOPS?.[safeMetric]) && STOPS[safeMetric].length >= 4
      ? STOPS[safeMetric]
      : // fallback minimal stops (won't crash even if theme/stops missing)
        (safeMetric === "events_count"
          ? [0, "#FBF7ED", 10, "#F6EFD7", 50, "#F0E2B6", 200, "#E9D48D", 1000, "#D8C07A"]
          : [0, "#F7F6F2", 1, "#EEECE6", 5, "#C6C1B7", 10, "#A9A399", 30, "#3B3F42"])

  const formatValue = (v) => {
    if (!Number.isFinite(v)) return "0"
    if (safeMetric === "events_count") return Math.round(v).toLocaleString()
    return Number(v).toFixed(2)
  }

  const [globalTimeline, setGlobalTimeline] = useState([])

  // init map + load data once
  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [0, 20],
      zoom: 2,
    })

    map.current.on("load", async () => {
      // ---------- Load GeoJSON ----------
      const res = await fetch(withBase("data/countries.geojson"))
      const countries = await res.json()
      countriesRef.current = countries

      map.current.addSource("countries", { type: "geojson", data: countries })

      // Base fill (set a safe default fill-color immediately)
      map.current.addLayer({
        id: "countries-fill",
        type: "fill",
        source: "countries",
        paint: {
          "fill-opacity": 0.65,
          "fill-opacity-transition": { duration: 180 },
          "fill-color": safeColor(THEME?.bgAlt, "#F7F6F2"),
        },
      })

      // Hover fill
      map.current.addLayer({
        id: "countries-fill-hover",
        type: "fill",
        source: "countries",
        paint: {
          "fill-opacity": 0.92,
          "fill-opacity-transition": { duration: 180 },
          "fill-color": safeColor(THEME?.bgAlt, "#F7F6F2"),
        },
        filter: ["==", ["get", "iso3_std"], ""],
      })

      // Outline
      map.current.addLayer({
        id: "countries-outline",
        type: "line",
        source: "countries",
        paint: {
          "line-width": 0.55,
          "line-color": safeColor(THEME?.ink, "#6F6A64"),
        },
      })

      // Hover outline (this is the one that was crashing when color was undefined)
      map.current.addLayer({
        id: "countries-hover",
        type: "line",
        source: "countries",
        paint: {
          "line-width": 2.75,
          "line-color": safeColor(THEME?.slider, safeColor(THEME?.core, "rgba(255,255,255,0.85)")),
          "line-opacity": 0.95,
          "line-blur": 0.2,
        },
        filter: ["==", ["get", "iso3_std"], ""],
      })

      // ---------- Hover handlers ----------
      map.current.on("mousemove", "countries-fill", (e) => {
        map.current.getCanvas().style.cursor = "pointer"
        const f = e.features?.[0]
        if (!f) return

        const p = f.properties || {}
        const key = String(p.iso3_std || "").trim()

        if (key && key !== hoveredIso3Ref.current) {
          hoveredIso3Ref.current = key
          map.current.setFilter("countries-hover", ["==", ["get", "iso3_std"], key])
          map.current.setFilter("countries-fill-hover", ["==", ["get", "iso3_std"], key])
        }

        const name = p.name || p.ADMIN || p.NAME_EN || p.NAME || p.admin || "Unknown"
        const value = Number(p.metric_value ?? 0)
        setHoverInfo({ x: e.point.x, y: e.point.y, name, value })
      })

      map.current.on("mouseleave", "countries-fill", () => {
        map.current.getCanvas().style.cursor = ""
        setHoverInfo(null)
        hoveredIso3Ref.current = null
        map.current.setFilter("countries-hover", ["==", ["get", "iso3_std"], ""])
        map.current.setFilter("countries-fill-hover", ["==", ["get", "iso3_std"], ""])
      })

      // ---------- Load CSV ----------
      const csvRes = await fetch(withBase("data/country_year_summary.csv"))
      const csvText = await csvRes.text()
      const parsed = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
      })

      rowsRef.current = parsed.data || []
      onDataLoaded?.(rowsRef.current)
      setGlobalTimeline(computeGlobalTimeline(rowsRef.current))

      // ---------- Prepare initial metric values ----------
      const initialYear = Number(year)
      const valueByIso3 = new Map()

      rowsRef.current
        .filter((r) => Number(r.year) === initialYear)
        .forEach((r) => {
          const k = String(r.iso3 || "").trim()
          if (!k) return
          const v = Number(r[safeMetric])
          valueByIso3.set(k, Number.isFinite(v) ? v : 0)
        })

      // Standardise iso3 + attach metric_value to each feature
      const countriesInit = countriesRef.current
      countriesInit.features.forEach((f) => {
        const p = f.properties || {}
        const key = String(
          p.iso3_std ||
            p.iso3 ||
            p.ISO3 ||
            p.ISO_A3 ||
            p.ISO3166_1_Alpha_3 ||
            p["ISO3166-1-Alpha-3"] ||
            p["ISO3166.1.Alpha.3"] ||
            ""
        ).trim()

        f.properties = {
          ...(f.properties || {}),
          iso3_std: key,
          metric_value: valueByIso3.get(key) ?? 0,
        }
      })

      map.current.getSource("countries")?.setData(countriesInit)

      // Apply choropleth expression (safeStops prevents crashes)
      const initialExpr = [
        "interpolate",
        ["linear"],
        ["coalesce", ["to-number", ["get", "metric_value"]], 0],
        ...safeStops,
      ]

      map.current.setPaintProperty("countries-fill", "fill-color", initialExpr)
      map.current.setPaintProperty("countries-fill-hover", "fill-color", initialExpr)

      loadedRef.current = true
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, []) // IMPORTANT: run once

  // --- update metric values when year/metric changes ---
  const maxStop = (stops = []) => {
    let m = 0
    for (let i = 0; i < stops.length; i += 2) m = Math.max(m, Number(stops[i]) || 0)
    return m
  }
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x))

  useEffect(() => {
    if (!map.current || !loadedRef.current) return
    if (!countriesRef.current || !rowsRef.current) return

    const countries = countriesRef.current
    const rows = rowsRef.current

    const valueByIso3 = new Map()
    const maxForMetric = maxStop(safeStops)

    rows
      .filter((r) => Number(r.year) === Number(year))
      .forEach((r) => {
        const k = String(r.iso3 || "").trim()
        if (!k) return
        const raw = Number(r[safeMetric])
        const v = Number.isFinite(raw) ? clamp(raw, 0, maxForMetric) : 0
        valueByIso3.set(k, v)
      })

    countries.features.forEach((f) => {
      const p = f.properties || {}
      const key = String(p.iso3_std || "").trim()
      f.properties = { ...(f.properties || {}), metric_value: valueByIso3.get(key) ?? 0 }
    })

    map.current.getSource("countries")?.setData(countries)
  }, [year, safeMetric]) // safeMetric already normalised

  // --- update paint when metric changes ---
  useEffect(() => {
    if (!map.current || !loadedRef.current) return

    const expr = [
      "interpolate",
      ["linear"],
      ["coalesce", ["to-number", ["get", "metric_value"]], 0],
      ...safeStops,
    ]

    map.current.setPaintProperty("countries-fill", "fill-color", expr)
    map.current.setPaintProperty("countries-fill-hover", "fill-color", expr)
  }, [safeMetric]) // safeStops is derived, no need in deps

  return (
    <div className="relative h-screen w-full">
      <div ref={mapContainer} className="h-screen w-full" />

      {/* Timeline panel (overlay on map only when enabled) */}
      {showTimeline && (
        <div className="absolute inset-x-4 bottom-4 z-20">
          <div
            className="rounded-2xl border bg-white/70 shadow-sm backdrop-blur-md"
            style={{ borderColor: safeColor(THEME?.border, "rgba(59,63,66,0.14)") }}
          >
            <TimelineChart data={globalTimeline} year={year} />
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoverInfo && (
        <div
          className="pointer-events-none absolute z-30 rounded-lg border bg-white/90 px-3 py-2 text-[11px] shadow-sm backdrop-blur"
          style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12, borderColor: "rgba(17,24,39,0.08)" }}
        >
          <div className="text-[12px] font-semibold leading-tight text-gray-900">{hoverInfo.name}</div>

          <div className="mt-1 flex items-baseline justify-between gap-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500">{metricLabel}</div>
            <div className="tabular-nums text-[12px] font-semibold text-gray-900">
              {formatValue(hoverInfo.value)}
            </div>
          </div>

          <div className="mt-1 text-[10px] text-gray-400">Year {year}</div>
        </div>
      )}
    </div>
  )
}