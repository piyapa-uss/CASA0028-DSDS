import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import Papa from 'papaparse'
import 'maplibre-gl/dist/maplibre-gl.css'

const STOPS = {
  events_count: [0,'#f7fbff', 10,'#deebf7', 50,'#c6dbef', 200,'#9ecae1', 1000,'#6baed6', 5000,'#3182bd', 20000,'#08519c'],
  fatality_rate: [0,'#f7fbff', 0.1,'#deebf7', 0.5,'#c6dbef', 1,'#9ecae1', 2,'#6baed6', 5,'#3182bd', 10,'#08519c']
}

export default function MapDisplay({ year, metric }) {
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
  const metricLabel =
    safeMetric === 'events_count' ? 'Events' : 'Fatality rate'

  const formatValue = (v) => {
    if (!Number.isFinite(v)) return '0'
    if (safeMetric === 'events_count') return Math.round(v).toLocaleString()
    return v.toFixed(2) // fatality_rate
    }

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
        paint: { 'line-width': 0.6, 'line-color': '#333' }
      })
      
      // Hover
      map.current.addLayer({
        id: 'countries-hover',
        type: 'line',
        source: 'countries',
        paint: {
            'line-width': 2.5,
            'line-color': '#111'
        },
        filter: ['==', ['get', 'iso3_std'], ''] // placeholder
      })
      
      // C2: Selected outline layer (on top of hover layer)
      map.current.addLayer({
        id: 'countries-selected',
        type: 'line',
        source: 'countries',
        paint: { 'line-width': 4, 'line-color': '#000' },
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

      loadedRef.current = true
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // 2) update data WHEN year/metric changes
  useEffect(() => {
    if (!map.current || !loadedRef.current) return
    if (!countriesRef.current || !rowsRef.current) return

    const countries = countriesRef.current
    const rows = rowsRef.current

    const valueByIso3 = new Map()
    rows
      .filter(r => Number(r.year) === Number(year))
      .forEach(r => {
        const k = String(r.iso3 || '').trim()
        if (!k) return
        const v = Number(r[safeMetric])
        valueByIso3.set(k, Number.isFinite(v) ? v : 0)
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
      <div ref={mapContainer} className="w-full h-screen" />

      {hoverInfo && (
    <div
    className="absolute z-20 pointer-events-none rounded-lg bg-white/95 shadow px-4 py-3 text-xs"
    style={{ left: hoverInfo.x + 12, top: hoverInfo.y + 12, minWidth: 180 }}
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

        {selectedInfo && (
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