import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import Papa from 'papaparse'
import 'maplibre-gl/dist/maplibre-gl.css'
import { computeGlobalTimeline } from "../utils/timeline"
import TimelineChart from "./TimelineChart"
import { THEME, STOPS } from "../theme"

export default function MapDisplay({ year, metric, onDataLoaded }) {
  const mapContainer = useRef(null)
  const map = useRef(null)

  const [hoverInfo, setHoverInfo] = useState(null)
  const [selectedInfo, setSelectedInfo] = useState(null)
  const selectedIso3Ref = useRef(null)

  const countriesRef = useRef(null)
  const rowsRef = useRef(null)
  const loadedRef = useRef(false)

  const hoveredIso3Ref = useRef(null)

  const safeMetric = metric || 'events_count'
  const metricLabel = safeMetric === 'events_count' ? 'Events' : 'Fatality rate'

  const formatValue = (v) => {
    if (!Number.isFinite(v)) return '0'
    if (safeMetric === 'events_count') return Math.round(v).toLocaleString()
    return v.toFixed(2) // fatality_rate
    }

  const [globalTimeline, setGlobalTimeline] = useState([])

  // 1) init map + load data ONCE
  useEffect(() => {
    if (map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [0, 20],
      zoom: 2
    })

    map.current.on('load', async () => {
      const res = await fetch('/data/countries.geojson')
      const countries = await res.json()
      countriesRef.current = countries

      map.current.addSource('countries', { type: 'geojson', data: countries })

      map.current.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        paint: { 
            'fill-opacity': 0.65,
            'fill-opacity-transition': { duration: 180 }
        }
      })

      map.current.addLayer({
        id: 'countries-fill-hover',
        type: 'fill',
        source: 'countries',
        paint: {
            'fill-opacity': 0.92,
            'fill-opacity-transition': { duration: 180 }
        },
        filter: ['==', ['get', 'iso3_std'], '']
      })

      map.current.addLayer({
        id: 'countries-outline',
        type: 'line',
        source: 'countries',
        paint: { 'line-width': 0.6, 'line-color': THEME.ink }
      })
      
      // Hover
      map.current.addLayer({
        id: 'countries-hover',
        type: 'line',
        source: 'countries',
        paint: {
            'line-width': 1.5, 'line-color': THEME.ink, 'line-opacity': 0.70 },
        filter: ['==', ['get', 'iso3_std'], ''] // placeholder
      })
      
      // C2: Selected outline layer (on top of hover layer)
      map.current.addLayer({
        id: 'countries-selected',
        type: 'line',
        source: 'countries',
        paint: { 'line-width': 2.5, 'line-color': THEME.accent, 'line-opacity': 0.85 },
        filter: ['==', ['get', 'iso3_std'], '']
        })
      
      // C3: Click handler 
      map.current.on('click', 'countries-fill', (e) => {
        const f = e.features?.[0]
        if (!f) return

        const p = f.properties || {}
        const name = p.name || p.ADMIN || p.NAME_EN || p.NAME || 'Unknown'
        const key = String(p.iso3_std || '').trim()
        if (!key) return

        selectedIso3Ref.current = key
        map.current.setFilter('countries-selected', ['==', ['get', 'iso3_std'], key])

        setSelectedInfo({
            name,
            value: Number(p.metric_value ?? 0)
        })
        })

      map.current.on('mousemove', 'countries-fill', (e) => {
        map.current.getCanvas().style.cursor = 'pointer'
        const f = e.features?.[0]
        if (!f) return

        const p = f.properties || {}
        const iso3 =
            p.iso3 ||
            p.ISO3166_1_Alpha_3 ||
            p['ISO3166-1-Alpha-3'] ||
            p['ISO3166.1.Alpha.3'] ||
            ''

        const key = String(iso3).trim()

        if (key && key !== hoveredIso3Ref.current) {
            hoveredIso3Ref.current = key
            map.current.setFilter('countries-hover', ['==', ['get', 'iso3_std'], key])
            map.current.setFilter('countries-fill-hover', ['==', ['get', 'iso3_std'], key])
        }
        
        const name = p.name || p.ADMIN || p.NAME_EN || p.NAME || p.admin || 'Unknown'
        const value = Number(p.metric_value ?? 0)

        setHoverInfo({ x: e.point.x, y: e.point.y, name, value })
      })

      map.current.on('mouseleave', 'countries-fill', () => {
        map.current.getCanvas().style.cursor = ''
        setHoverInfo(null)

        hoveredIso3Ref.current = null
        map.current.setFilter('countries-hover', ['==', ['get', 'iso3_std'], ''])
        map.current.setFilter('countries-fill-hover', ['==', ['get', 'iso3_std'], ''])
      })

      // CSV
      const csvRes = await fetch('/data/country_year_summary.csv')
      const csvText = await csvRes.text()
      const parsed = Papa.parse(csvText, { header: true, dynamicTyping: true, skipEmptyLines: true })
      rowsRef.current = parsed.data

      if (onDataLoaded) onDataLoaded(rowsRef.current)

      setGlobalTimeline(computeGlobalTimeline(rowsRef.current))

      console.log("CSV columns:", Object.keys(parsed.data?.[0] || {}))

        // 1) Build metric_value for initial year (so first paint isn't "default grey")
        const initialYear = Number(year) // year prop, set default year 2000
        const valueByIso3 = new Map() 

        rowsRef.current
          .filter(r => Number(r.year) === initialYear)
          .forEach(r => {
            const k = String(r.iso3 || '').trim()
            if (!k) return
            const v = Number(r[safeMetric])
            valueByIso3.set(k, Number.isFinite(v) ? v : 0)
          })

        const countriesInit = countriesRef.current
        countriesInit.features.forEach(f => {
          const p = f.properties || {}
          const iso3 =
            p.iso3 ||
            p.ISO3166_1_Alpha_3 ||
            p['ISO3166-1-Alpha-3'] ||
            p['ISO3166.1.Alpha.3']

          const key = String(iso3 || '').trim()
          f.properties = {
            ...(f.properties || {}),
            iso3_std: key,
            metric_value: valueByIso3.get(key) ?? 0,
          }
      })

        map.current.getSource('countries')?.setData(countriesInit)

        // 2) Set initial paint immediately (no "grey overlay" moment)
        const initialExpr = [
          'interpolate',
          ['linear'],
          ['coalesce', ['to-number', ['get', 'metric_value']], 0],
          ...STOPS[safeMetric],
        ]

        map.current.setPaintProperty('countries-fill', 'fill-color', initialExpr)
        map.current.setPaintProperty('countries-fill-hover', 'fill-color', initialExpr)

      loadedRef.current = true
    }) 

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // 2) update data WHEN year/metric changes
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
    const maxForMetric = maxStop(STOPS[safeMetric])

    rows
      .filter(r => Number(r.year) === Number(year))
      .forEach(r => {
        const k = String(r.iso3 || '').trim()
        if (!k) return

        const raw = Number(r[safeMetric])
        const v = Number.isFinite(raw) ? clamp(raw, 0, maxForMetric) : 0
        valueByIso3.set(k, v)
      })

    countries.features.forEach(f => {
      const p = f.properties || {}
      const iso3 =
        p.iso3 ||
        p.ISO3166_1_Alpha_3 ||
        p['ISO3166-1-Alpha-3'] ||
        p['ISO3166.1.Alpha.3']

      const key = String(iso3 || '').trim()
      f.properties = { ...(f.properties || {}),
      iso3_std: key, 
      metric_value: valueByIso3.get(key) ?? 0 }
    })

    map.current.getSource('countries')?.setData(countries)
  }, [year, safeMetric])

  // 3) update paint WHEN metric changes
  useEffect(() => {
     if (!map.current || !loadedRef.current) return

    const expr = [
        'interpolate',
        ['linear'],
        ['coalesce', ['to-number', ['get', 'metric_value']], 0],
        ...STOPS[safeMetric]
    ]

    map.current.setPaintProperty('countries-fill', 'fill-color', expr)

    map.current.setPaintProperty('countries-fill-hover', 'fill-color', expr)
}, [safeMetric])


  return (
    <div className="relative w-full h-screen">
      <div ref={mapContainer} className="w-full h-screen" year={year} />

      <TimelineChart data={globalTimeline} year={year}/>

      {hoverInfo && (
    <div
      className="absolute z-20 pointer-events-none rounded-lg shadow px-4 py-3 text-xs"
      style={{
        background: THEME.panel,
        left: hoverInfo.x + 12,
        top: hoverInfo.y + 12,
        minWidth: 180,
      }}
    >
        <div className="text-sm font-semibold leading-tight">
            {hoverInfo.name}
        </div>

        <div className="mt-1 flex items-baseline justify-between gap-3">
            <div className="text-gray-600">{metricLabel}</div>
            <div className="font-semibold">{formatValue(hoverInfo.value)}</div>
        </div>

        <div className="mt-1 text-gray-500">Year {year}</div>
    </div>
        )}

        {selectedInfo && !hoverInfo && (
            <div className="absolute right-4 bottom-4 z-30 w-72 rounded-lg bg-white/95 shadow px-4 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{selectedInfo.name}</div>
                <button
                    className="text-gray-500 hover:text-black"
                    onClick={() => {
                    setSelectedInfo(null)
                    selectedIso3Ref.current = null
                    map.current?.setFilter('countries-selected', ['==', ['get', 'iso3_std'], ''])
                    }}
                >
                    ✕
                </button>
                </div>

                <div className="mt-2 text-gray-700">
                <div className="flex items-baseline justify-between">
                    <span className="text-gray-600">{metricLabel}</span>
                    <span className="font-semibold">{formatValue(selectedInfo.value)}</span>
                </div>
                <div className="mt-1 text-gray-500">Year {year}</div>
                </div>
            </div>
        )}

    </div>
  )
}