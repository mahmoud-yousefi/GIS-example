import { Route, Routes } from 'react-router-dom';
import AccessibleMap from '../components/OpenLayers';
import Home from '../components/Home';
import MapWith3DModels from '../components/MapWith3DModels';
import MapLibre from '../components/MapLibre';
import Mapbox from '../components/Mapbox';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/openlayers" element={<AccessibleMap />} />
      <Route path="/MapWith3DModels" element={<MapWith3DModels />} />
      <Route path="/maplibre" element={<MapLibre />} />
      <Route path="/Mapbox" element={<Mapbox />} />
    </Routes>
  );
};

export default RoutesProvider;