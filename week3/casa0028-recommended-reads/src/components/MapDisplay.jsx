import { useState } from 'react';
import { Map, Source, Layer, Popup } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css';
import { plaqueData } from '../data/open-plaques-london-2023-11-10-filtered';

export default function MapDisplay(props) {
  const [selectedPlaque, setSelectedPlaque] = useState(null)
   
  const plaqueLayerStyle = {
       id: 'plaques-layer',
       type: 'circle',
       source: 'plaques-data',
       paint: {
           'circle-radius': 6,
           'circle-color': '#6d9c55',
           'circle-stroke-width': 2,
           'circle-stroke-color': '#ffffff'
       },
   }  
  
const handleMapClick = (event) => {
  const features = event.features;
    if (features && features.length) {
        const clickedFeature = features[0];
        setSelectedPlaque(clickedFeature) // ✅ ตามอาจารย์: เก็บ feature ที่คลิก
    }
  }

    return (
    <Map
      initialViewState={{
        longitude: props.longitude,
        latitude: props.latitude,
        zoom: props.zoom
      }}
      style={{width: '100%', height: '100vh'}}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={['plaques-layer']}
      onClick={handleMapClick}
   >
       <Source
          id="plaques-data"
          type="geojson"
          data={plaqueData}
       >
          <Layer {...plaqueLayerStyle} />
          
       </Source>
       {selectedPlaque && (
        <Popup
          anchor="bottom"
          longitude={selectedPlaque.geometry.coordinates[0]}
          latitude={selectedPlaque.geometry.coordinates[1]}
          onClose={() => setSelectedPlaque(null)}
          closeOnClick={false}
        >
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedPlaque.properties.lead_subject || 'Plaque'}
            </h2>

            <p className="text-sm text-gray-500">
              {(selectedPlaque.properties.inscription || '').slice(0, 120)}
              {(selectedPlaque.properties.inscription || '').length > 120 ? '…' : ''}
            </p>

            <button
              className="rounded-lg border border-gray-200 px-3 py-2 font-medium mt-3"
              onClick={() =>
                console.log('Fetch recommended reading for', selectedPlaque.properties.lead_subject)
              }
            >
              Recommended Reading
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
}
