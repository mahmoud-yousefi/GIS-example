import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from '@turf/turf';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MapboxExample: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [roundedArea, setRoundedArea] = useState<number | undefined>(undefined);

  useEffect(() => {
    mapboxgl.accessToken = 'YOUR_VALID_MAPBOX_ACCESS_TOKEN';

    if (mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: [-91.874, 42.76],
        zoom: 12
      });

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'draw_polygon'
      });

      mapRef.current.addControl(draw);

      mapRef.current.on('draw.create', updateArea);
      mapRef.current.on('draw.delete', updateArea);
      mapRef.current.on('draw.update', updateArea);

      function updateArea(e: any) {
        const data = draw.getAll();
        if (data.features.length > 0) {
          const area = turf.area(data);
          setRoundedArea(Math.round(area * 100) / 100);
        } else {
          setRoundedArea(undefined);
          if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
        }
      }
    }
  }, []);

  return (
    <>
      <div ref={mapContainerRef} id="map" className="h-full"></div>
      <div className="calculation-box h-20 w-36 absolute bottom-10 left-2.5 bg-white bg-opacity-90 p-4 text-center">
        <p className="font-sans m-0 text-xs">Click the map to draw a polygon.</p>
        <div id="calculated-area">
          {roundedArea !== undefined && (
            <>
              <p className="font-sans m-0 text-xs">
                <strong>{roundedArea}</strong>
              </p>
              <p className="font-sans m-0 text-xs">square meters</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MapboxExample;
