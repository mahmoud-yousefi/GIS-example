import { Route, Routes } from 'react-router-dom';
import AccessibleMap from '../components/OpenLayers';
import Home from '../components/Home';
import MapWith3DModels from '../components/MapWith3DModels';
import MapLibre from '../components/MapLibre';
import Mapbox from '../components/Mapbox';
import Alignment from '../components/Alignment';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/GIS-example/" element={<Home />} />
      <Route path="/GIS-example/openlayers" element={<AccessibleMap />} />
      <Route path="/GIS-example/MapWith3DModels" element={<MapWith3DModels />} />
      <Route path="/GIS-example/maplibre" element={<MapLibre />} />
      <Route path="/GIS-example/Mapbox" element={<Mapbox />} />
      <Route path="/GIS-example/Alignment" element={<Alignment />} />
    </Routes>
  );
};

export default RoutesProvider;