import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import ImageLayer from 'ol/layer/Image';
import Static from 'ol/source/ImageStatic';
import { fromLonLat, get as getProjection, transformExtent } from 'ol/proj';
import GeoTIFF from 'geotiff'; // Requires geotiff.js library

const AlignmentApp: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | null>(null);
  const [imageLayer, setImageLayer] = useState<ImageLayer<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize the map
  useEffect(() => {
    const mapInstance = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    setMap(mapInstance);

    return () => {
      mapInstance.setTarget(undefined);
    };
  }, []);

  // Extract metadata and align image
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      try {
        const tiff = await GeoTIFF.fromBlob(file);
        const image = await tiff.getImage();
        const meta = image.getBoundingBox(); // Get image extent (left, bottom, right, top)
        const projection = image.getProjection() || 'EPSG:4326'; // Default to WGS84 if not provided

        const extent = transformExtent(
          [meta[0], meta[1], meta[2], meta[3]],
          projection,
          getProjection('EPSG:3857')! // Map projection (Web Mercator)
        );

        addImageToMap(imageUrl, extent as [number, number, number, number]);
      } catch (err) {
        console.error('Error reading georeferencing metadata:', err);
        setError('Metadata not found or invalid. You can adjust manually.');
        addImageToMap(imageUrl, [-1e6, -1e6, 1e6, 1e6]); // Default extent
      }
    }
  };

  const addImageToMap = (imageUrl: string, extent: [number, number, number, number]) => {
    const newImageLayer = new ImageLayer({
      source: new Static({
        url: imageUrl,
        imageExtent: extent,
      }),
    });

    if (map) {
      if (imageLayer) map.removeLayer(imageLayer); // Remove previous image layer if any
      map.addLayer(newImageLayer);
      setImageLayer(newImageLayer);

      // Zoom to image extent
      map.getView().fit(extent, { size: map.getSize(), maxZoom: 18 });
    }
  };

  return (
    <div>
      <h2>Image Alignment App</h2>

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ marginBottom: '10px' }}
      />

      {/* Error Message */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height: '500px', marginBottom: '10px' }} />

      {/* Manual Adjustment Controls (if needed) */}
      {imageLayer && (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setError(null)}>Clear Error</button>
        </div>
      )}
    </div>
  );
};

export default AlignmentApp;
