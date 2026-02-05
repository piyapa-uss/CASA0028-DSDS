import { useState } from 'react'
import './tw-styles.css'

import TitleBar from './components/TitleBar'
import MapDisplay from './components/MapDisplay'
import PlaqueModal from './components/PlaqueModal'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(true)

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 OpenPlaques Recommended Reading"
        subtitle="Week 2 workshop prototype"
      />

      <MapDisplay
        longitude={-0.13731}
        latitude={51.521699}
        zoom={16}
      />

      {isModalOpen ? (
        <PlaqueModal
          title="Example plaque"
          description="This description comes from props, not hardcoded text."
          onClose={() => setIsModalOpen(false)}
        />
      ) : null}
    </div>
  )
}

export default App