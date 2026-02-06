import { useState } from 'react'
import './tw-styles.css'
import TitleBar from './components/TitleBar'
import MapDisplay from './components/MapDisplay'
import PlaqueModal from './components/PlaqueModal'

function App() {
  const [selectedPlaque, setSelectedPlaque] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-screen-xl bg-gray-50 min-h-screen">
      <TitleBar
        title="📚 OpenPlaques Recommended Reading"
        subtitle="Week 4 Fetching"
      />

      <MapDisplay
        longitude={-0.13731}
        latitude={51.521699}
        zoom={16}
        setIsModalOpen={setIsModalOpen}
        selectedPlaque={selectedPlaque}
        setSelectedPlaque={setSelectedPlaque}

      />

      {isModalOpen ? <PlaqueModal setIsModalOpen={setIsModalOpen} selectedPlaque={selectedPlaque} /> : null}
     
    </div>
  )
}

export default App