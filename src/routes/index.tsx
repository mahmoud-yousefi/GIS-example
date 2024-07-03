import { Route, Routes } from 'react-router-dom';
import AccessibleMap from '../components/OpenLayers';
import Home from '../components/Home';
import MapWith3DModels from '../components/MapWith3DModels';
import MapLibre from '../components/MapLibre';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/openlayers" element={<AccessibleMap />} />
      <Route path="/MapWith3DModels" element={<MapWith3DModels />} />
      <Route path="/maplibre" element={<MapLibre />} />
    </Routes>
  );
};

export default RoutesProvider;