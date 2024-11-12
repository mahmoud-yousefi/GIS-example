import React, { useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { Point } from 'ol/geom';
import Feature from 'ol/Feature';
import { transform } from 'ol/proj';
import { Fill, Stroke, Style, Circle as CircleStyle } from 'ol/style';

// Utility function to translate and rotate a point
export const translateAndRotatePoint = (
  point: [number, number],
  dx: number,
  dy: number,
  angle: number
): [number, number] => {
  // Translate coordinates
  const x = point[0] + dx;
  const y = point[1] + dy;

  // Convert angle to radians
  const radians = (angle * Math.PI) / 180;

  // Rotate coordinates
  const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
  const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);

  return [rotatedX, rotatedY];
};

// Main map component
const Alignment: React.FC = () => {
  useEffect(() => {
    // Initialize map
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: transform([0, 0], 'EPSG:4326', 'EPSG:3857'),
        zoom: 2,
      }),
    });

    // Define initial and transformed point coordinates
    const originalPoint: [number, number] = [10, 10];
    const transformedPoint = translateAndRotatePoint(originalPoint, 5000, 3000, 45);

    // Create and style the point feature
    const pointFeature = new Feature({
      geometry: new Point(transform(transformedPoint, 'EPSG:4326', 'EPSG:3857')),
    });
    pointFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'black', width: 1 }),
        }),
      })
    );

    // Add vector layer to display the point
    const vectorSource = new VectorSource({
      features: [pointFeature],
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    map.addLayer(vectorLayer);

    // Cleanup function to remove map on unmount
    return () => {
      map.setTarget(undefined);
    };
  }, []);

  return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
};

export default Alignment;
