import { useState } from 'react'
import MapDisplay from './components/MapDisplay'

export default function App() {
  // NEW: year state (Year slider for filtering interactive)
  const [year, setYear] = useState(2000)
  const [metric, setMetric] = useState('events_count')

  const LEGEND = {
    events_count: [
      { c:'#f7fbff', t:'0' },
      { c:'#deebf7', t:'10' },
      { c:'#c6dbef', t:'50' },
      { c:'#9ecae1', t:'200' },
      { c:'#6baed6', t:'1,000' },
      { c:'#3182bd', t:'5,000' },
      { c:'#08519c', t:'20,000+' }
    ],
    fatality_rate: [
      { c:'#f7fbff', t:'0' },
      { c:'#deebf7', t:'0.1' },
      { c:'#c6dbef', t:'0.5' },
      { c:'#9ecae1', t:'1' },
      { c:'#6baed6', t:'2' },
      { c:'#3182bd', t:'5' },
      { c:'#08519c', t:'10+' }
    ]
  }

  return (
    <div className="relative w-full h-screen">
      {/* Map */}
      <MapDisplay year={year} metric={metric} />

      {/* Slider (top-left) */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded shadow">
        <div className="text-sm font-semibold mb-2">Year: {year}</div>

        <input
          type="range"
          min="2000"
          max="2024"
          step="1"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="w-64"
        />

        <div className="mt-3 flex gap-2">
          <button
            onClick={() => setMetric('events_count')}
            className={`flex-1 rounded px-3 py-2 text-sm ${
              metric === 'events_count' ? 'bg-black text-white' : 'bg-white border'
            }`}
          >
            Events
          </button>

          <button
            onClick={() => setMetric('fatality_rate')}
            className={`flex-1 rounded px-3 py-2 text-sm ${
              metric === 'fatality_rate' ? 'bg-black text-white' : 'bg-white border'
            }`}
          >
            Fatality rate
          </button>
        </div>
        
        {/* Legend */}
        <div className="mt-3">
          <div className="text-xs font-semibold mb-2">
            Legend — {metric === 'events_count' ? 'Events' : 'Fatality rate'}
          </div>

          <div className="space-y-1">
            {LEGEND[metric].map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="inline-block h-3 w-3 rounded-sm border" style={{ background: d.c }} />
                <span className="text-gray-700">{d.t}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
