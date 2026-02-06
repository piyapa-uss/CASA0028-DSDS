import { Map, Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { plaqueData } from "../data/open-plaques-london-2023-11-10-filtered";

export default function MapDisplay(props) {
  const plaqueLayerStyle = {
    id: "plaques-layer",
    type: "circle",
    source: "plaques-data",
    paint: {
      "circle-radius": 6,
      "circle-color": "#6cafe2",
      "circle-stroke-width": 3,
      "circle-stroke-color": "#2076d1",
    },
  };

  const handleMapClick = (event) => {
    const features = event.features;
    if (features && features.length) {
      const clickedFeature = features[0];
      props.setSelectedPlaque(clickedFeature);     // ✅ ส่งขึ้น App
      // จะเปิด modal เลยก็ได้ แต่ส่วนใหญ่ให้เปิดจากปุ่ม
      // props.setIsModalOpen(true);
    }
  };

  const selectedPlaque = props.selectedPlaque;

  return (
    <Map
      initialViewState={{
        longitude: props.longitude,
        latitude: props.latitude,
        zoom: props.zoom,
      }}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      interactiveLayerIds={["plaques-layer"]}
      onClick={handleMapClick}
    >
      <Source id="plaques-data" type="geojson" data={plaqueData}>
        <Layer {...plaqueLayerStyle} />
      </Source>

      {selectedPlaque && (
        <Popup
          anchor="bottom"
          longitude={selectedPlaque.geometry.coordinates[0]}
          latitude={selectedPlaque.geometry.coordinates[1]}
          onClose={() => props.setSelectedPlaque(null)}  // ✅ ปิด popup
          closeOnClick={false}
        >
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {selectedPlaque.properties.lead_subject_name ||
                selectedPlaque.properties.lead_subject ||
                "Plaque"}
            </h2>

            <p className="text-sm text-gray-500">
              {(selectedPlaque.properties.inscription || "").slice(0, 120)}
              {(selectedPlaque.properties.inscription || "").length > 120
                ? "…"
                : ""}
            </p>

            <button
              className="rounded-lg border border-gray-200 px-3 py-2 font-medium mt-3"
              onClick={() => props.setIsModalOpen(true)}  // ✅ เปิด modal
            >
              Recommended Reading
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
}