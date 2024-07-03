// src/components/MapWith3DModels.tsx
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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

      function calculateDistanceMercatorToMeters(from: maplibregl.MercatorCoordinate, to: maplibregl.MercatorCoordinate) {
        const mercatorPerMeter = from.meterInMercatorCoordinateUnits();
        const dEast = to.x - from.x;
        const dEastMeter = dEast / mercatorPerMeter;
        const dNorth = from.y - to.y;
        const dNorthMeter = dNorth / mercatorPerMeter;
        return { dEastMeter, dNorthMeter };
      }

      async function loadModel() {
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync('https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf');
        const model = gltf.scene;
        return model;
      }

      const sceneOrigin = new maplibregl.LngLat(11.5255, 47.6677);
      const model1Location = new maplibregl.LngLat(11.527, 47.6678);
      const model2Location = new maplibregl.LngLat(11.5249, 47.6676);

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

          const sceneElevation = map.queryTerrainElevation(sceneOrigin) || 0;
          const model1Elevation = map.queryTerrainElevation(model1Location) || 0;
          const model2Elevation = map.queryTerrainElevation(model2Location) || 0;
          const model1up = model1Elevation - sceneElevation;
          const model2up = model2Elevation - sceneElevation;

          const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(sceneOrigin);
          const model1Mercator = maplibregl.MercatorCoordinate.fromLngLat(model1Location);
          const model2Mercator = maplibregl.MercatorCoordinate.fromLngLat(model2Location);
          const { dEastMeter: model1east, dNorthMeter: model1north } = calculateDistanceMercatorToMeters(sceneOriginMercator, model1Mercator);
          const { dEastMeter: model2east, dNorthMeter: model2north } = calculateDistanceMercatorToMeters(sceneOriginMercator, model2Mercator);

          const model1 = await loadModel();
          const model2 = model1.clone();

          model1.position.set(model1east, model1up, model1north);
          model2.position.set(model2east, model2up, model2north);

          scene.add(model1);
          scene.add(model2);

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

        render: (gl, mercatorMatrix) => {
          const { camera, scene, renderer } = customLayer;
          if (!camera || !scene || !renderer) return;

          const offsetFromCenterElevation = map.queryTerrainElevation(sceneOrigin) || 0;
          const sceneOriginMercator = maplibregl.MercatorCoordinate.fromLngLat(sceneOrigin, offsetFromCenterElevation);

          const sceneTransform = {
            translateX: sceneOriginMercator.x,
            translateY: sceneOriginMercator.y,
            translateZ: sceneOriginMercator.z,
            scale: sceneOriginMercator.meterInMercatorCoordinateUnits(),
          };

          const m = new THREE.Matrix4().fromArray(mercatorMatrix);
          const l = new THREE.Matrix4()
            .makeTranslation(sceneTransform.translateX, sceneTransform.translateY, sceneTransform.translateZ)
            .scale(new THREE.Vector3(sceneTransform.scale, -sceneTransform.scale, sceneTransform.scale));

          camera.projectionMatrix = m.multiply(l);
          renderer.resetState();
          renderer.render(scene, camera);
          map.triggerRepaint();
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
