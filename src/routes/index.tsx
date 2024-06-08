import { Route, Routes } from 'react-router-dom';
import AccessibleMap from '../components/AccessibleMap';
import Home from '../components/Home';
import AdvancedMapboxVectorTiles from '../components/AdvancedMapboxVectorTiles';

const RoutesProvider = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/accessible-map" element={<AccessibleMap />} />
      <Route path="/advanced-mapbox-vector-titles" element={<AdvancedMapboxVectorTiles />} />
    </Routes>
  );
};

export default RoutesProvider;