import './tw-styles.css'

import TitleBar from './components/TitleBar'
import MapDisplay from './components/MapDisplay'

function App() {
  
  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 OpenPlaques Recommended Reading"
        subtitle="Week 3 Adding Interactivity"
      />

      <MapDisplay
        longitude={-0.13731}
        latitude={51.521699}
        zoom={16}
      
      />
    </div>
  )
}

export default App