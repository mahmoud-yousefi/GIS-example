import { Route, Routes } from 'react-router-dom';
import AccessibleMap from '../components/OpenLayers';
import Home from '../components/Home';
import AdvancedMapboxVectorTiles from '../components/MapLibre';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/openlayers" element={<AccessibleMap />} />
      <Route path="/maplibre" element={<AdvancedMapboxVectorTiles />} />
    </Routes>
  );
};

export default RoutesProvider;