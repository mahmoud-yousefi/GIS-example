// src/components/MapWith3DModels.tsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ExtendedCustomLayerInterface extends maplibregl.CustomLayerInterface {
  camera: THREE.Camera | null;
  scene: THREE.Scene | null;
  renderer: THREE.WebGLRenderer | null;
}

const MapWith3DModels: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function main() {
      const map = new maplibregl.Map({
        container: mapContainerRef.current!,
        center: [11.5257, 47.668],
        zoom: 16.27,
        pitch: 60,
        bearing: -28.5,
        antialias: true,
        style: {
          version: 8,
          layers: [
            {
              id: 'baseColor',
              type: 'background',
              paint: {
                'background-color': '#fff',
                'background-opacity': 1.0,
              },
            },
            {
              id: 'hills',
              type: 'hillshade',
              source: 'hillshadeSource',
              layout: { visibility: 'visible' },
              paint: { 'hillshade-shadow-color': '#473B24' },
            },
          ],
          terrain: {
            source: 'terrainSource',
            exaggeration: 1,
          },
          sources: {
            terrainSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256,
            },
            hillshadeSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256,
            },
          },
        },
      });

      const customLayer: ExtendedCustomLayerInterface = {
        id: '3d-model',
        type: 'custom',
        renderingMode: '3d',

        onAdd: async (map, gl) => {
          const camera = new THREE.Camera();
          const scene = new THREE.Scene();
          scene.rotateX(Math.PI / 2);
          scene.scale.multiply(new THREE.Vector3(1, 1, -1));

          const light = new THREE.DirectionalLight(0xffffff);
          light.position.set(50, 70, -30).normalize();
          scene.add(light);

          const axesHelper = new THREE.AxesHelper(60);
          scene.add(axesHelper);

          const renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });

          renderer.autoClear = false;

          // Store the initialized objects in the closure variables
          customLayer.camera = camera;
          customLayer.scene = scene;
          customLayer.renderer = renderer;
        },

        render: () => {
          const { camera, scene, renderer } = customLayer;
          if (!camera || !scene || !renderer) return;
        },

        camera: null,
        scene: null,
        renderer: null,
      };

      map.on('load', async () => {
        map.addLayer(customLayer);
      });

      return () => {
        map.remove();
      };
    }

    main();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default MapWith3DModels;
