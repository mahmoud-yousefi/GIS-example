import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Unit } from 'maplibre-gl';
import * as turf from '@turf/turf';
import MapboxDraw, { DrawModes } from '@mapbox/mapbox-gl-draw';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './index.css';
import { DarkModeIcon } from '../OpenLayers';
import zoomOutIconUrl from '@material-symbols/svg-400/outlined/zoom_out.svg';
import zoomInIconUrl from '@material-symbols/svg-400/outlined/zoom_in.svg';
import undoIconUrl from '@material-symbols/svg-400/outlined/undo.svg';
import fullscreenIcon from '@material-symbols/svg-400/outlined/fullscreen.svg'
import { Geometry, Position } from 'geojson';


// Set the RTL text plugin
maplibregl.setRTLTextPlugin(
    'https://unpkg.com/@mapbox/mapbox-gl-rtl-text@0.2.3/mapbox-gl-rtl-text.min.js',
    () => { },
    true // Lazy load the plugin
);

const drawModes = {
    none: 'simple_select',
    point: 'draw_point',
    line_string: 'draw_line_string',
    polygon: 'draw_polygon',
} as const;

type DrawModeKeys = keyof typeof drawModes;

const MapWithDrawSupport: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [mouseCoordinates, setMouseCoordinates] = useState({
        point: { x: 0, y: 0 },
        lngLat: { lng: 0, lat: 0 },
    });
    const [map, setMap] = useState<maplibregl.Map | null>(null);
    const [draw, setDraw] = useState<MapboxDraw | null>(null);
    const [drawMode, setDrawMode] = useState<DrawModeKeys>('none');
    const [coordinateSystem, setCoordinateSystem] = useState<string>('latlon');
    const [precision, setPrecision] = useState<number>(2);
    const [unit, setUnit] = useState<Unit>('metric');

    useEffect(() => {
        const initializeMap = () => {
            const initializedMap = new maplibregl.Map({
                container: mapContainerRef.current!,
                style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
                center: [50.3763, 33.2788],
                zoom: 4,
            });

            initializedMap.on('load', () => {
                const initializedDraw = new MapboxDraw({
                    displayControlsDefault: false,
                    controls: {
                        polygon: true,
                        trash: true,
                    },
                });

                initializedMap.addControl(initializedDraw);

                initializedMap.on('mousemove', (e) => {
                    setMouseCoordinates({
                        point: e.point,
                        lngLat: e.lngLat.wrap(),
                    });
                });

                initializedMap.on('draw.create', updateArea);
                initializedMap.on('draw.delete', updateArea);
                initializedMap.on('draw.update', updateArea);

                setMap(initializedMap);
                setDraw(initializedDraw);
            });

            return () => {
                initializedMap.remove();
            };
        };

        initializeMap();
    }, []);

    const updateArea = (e: any) => {
        if (!draw) return;

        const data = draw.getAll();
        (map?.getSource('drawn-features') as any)?.setData({
            type: 'FeatureCollection',
            features: data.features,
        });
        const answer = document.getElementById('calculated-area');
        if (data.features.length > 0) {
            const area = turf.area(data);
            const roundedArea = Math.round(area * 100) / 100;
            if (answer) {
                answer.innerHTML = `<p><strong>${roundedArea}</strong></p><p>square meters</p>`;
            }
        } else {
            if (answer) {
                answer.innerHTML = '';
            }
            if (e.type !== 'draw.delete') {
                alert('Use the draw tools to draw a polygon!');
            }
        }
    };

    const onChangeUnit = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUnit(event.target.value as Unit);
    };

    const handleModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedMode = event.target.value as DrawModeKeys;
        setDrawMode(selectedMode);

        if (draw) {
            draw.changeMode(drawModes[selectedMode] as DrawModes);
        }
    };

    const handleCoordinateSystemChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCoordinateSystem(event.target.value);
    };

    const handlePrecisionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrecision(Number(event.target.value));
    };

    const formatCoordinates = () => {
        const { lng, lat } = mouseCoordinates.lngLat;
        const formattedLngLat = `Lat: ${lat.toFixed(precision)}, Lng: ${lng.toFixed(precision)}`;
        if (coordinateSystem === 'utm') {
            // Dummy UTM conversion for demonstration
            const utmEast = lng * 10000 + 500000;
            const utmNorth = lat * 10000 + 500000;
            return `UTM: ${utmEast.toFixed(precision)}, ${utmNorth.toFixed(precision)}`;
        }
        return formattedLngLat;
    };

    useEffect(() => {
        if (!map) return;

        const scale = new maplibregl.ScaleControl({
            maxWidth: 80,
            unit,
        });

        map.addControl(scale);

        return () => {
            map.removeControl(scale);
        };
    }, [map, unit]);

    useEffect(() => {
        if (map && draw) {
            // Set up style for drawn features
            map.addSource('drawn-features', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [],
                },
            });
    
            map.addLayer({
                id: 'drawn-features',
                type: 'fill', // Use 'fill' type for polygons
                source: 'drawn-features',
                paint: {
                    'fill-color': 'green', // Green fill color
                    'fill-opacity': 0.5,
                    'fill-outline-color': 'purple', // Purple border color
                },
            });
    
            // Attach event handlers for draw actions
            map.on('draw.create', updateArea);
            map.on('draw.delete', updateArea);
            map.on('draw.update', updateArea);
        }
    
        return () => {
            if (map) {
                map.off('draw.create', updateArea);
                map.off('draw.delete', updateArea);
                map.off('draw.update', updateArea);
                map.removeSource('drawn-features');
                map.removeLayer('drawn-features');
            }
        };
    }, [map, draw]);
    

    const handleZoomOut = () => {
        if (map) {
            const zoom = map.getZoom();
            map.setZoom(zoom - 1);
        }
    };

    const handleZoomIn = () => {
        if (map) {
            const zoom = map.getZoom();
            map.setZoom(zoom + 1);
        }
    };

    const handleUndo = () => {
        if (draw) {
            const data = draw.getAll();
            if (data.features.length > 0) {
                const lastFeature = data.features[data.features.length - 1];
                const geometry = lastFeature.geometry as Geometry;

                if (geometry.type === 'Point' || geometry.type === 'LineString' || geometry.type === 'Polygon') {
                    let coordinates: any = [];

                    if (geometry.type === 'Point') {
                        coordinates = [[[...geometry.coordinates]] as any];
                    } else if (geometry.type === 'LineString') {
                        coordinates = [[...geometry.coordinates] as Position[]];
                    } else if (geometry.type === 'Polygon') {
                        coordinates = geometry.coordinates.map(ring => [...ring] as Position[]);
                    }

                    if (coordinates.length > 0) {
                        // Remove the last coordinate
                        coordinates[coordinates.length - 1].pop();

                        // Update the feature with the remaining coordinates
                        draw.delete(lastFeature.id as string);
                        draw.add({
                            ...lastFeature,
                            geometry: {
                                ...geometry,
                                coordinates,
                            },
                        });
                    } else {
                        // If no coordinates left, delete the entire feature
                        draw.delete(lastFeature.id as string);
                    }
                }
            }
        }
    };

    const handleFullscreen = () => {
        if (mapContainerRef.current) {
            if (!document.fullscreenElement) {
                mapContainerRef.current.requestFullscreen().catch((err) => {
                    alert(
                        `Error attempting to enable full screen mode: ${err.message} (${err.name})`
                    );
                });
            } else {
                document.exitFullscreen();
            }
        }
    };


    return (
        <>
            <div className="relative h-screen" id="map">
                <div ref={mapContainerRef} className="w-full h-full" />
                <pre className="block absolute top-0 p-2 font-bold border-none rounded text-sm text-center text-[#414040] bg-white bg-opacity-75 shadow-lg">
                    {`Mouse Coordinates:\n${JSON.stringify(mouseCoordinates.point)}\n${formatCoordinates()}`}
                </pre>
            </div>
            <div className="flex p-4 space-x-2 bg-gray-50 dark:bg-gray-800 rounded-md shadow-md">
                <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="type">Geometry type:</label>
                    <select
                        value={drawMode}
                        onChange={handleModeChange}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                    >
                        <option value="none">None</option>
                        <option value="point">Point</option>
                        <option value="line_string">LineString</option>
                        <option value="polygon">Polygon</option>
                    </select>
                </div>
                <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="coordinate-system">Mouse position:</label>
                    <select
                        value={coordinateSystem}
                        onChange={handleCoordinateSystemChange}
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                    >
                        <option value="latlon">Lat/Lon</option>
                        <option value="utm">UTM</option>
                    </select>
                </div>
                <div className="flex items-center space-x-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200" htmlFor="precision">Precision:</label>
                    <input
                        type="number"
                        value={precision}
                        onChange={handlePrecisionChange}
                        className="w-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
                        min="0"
                        max="10"
                    />
                </div>
                <div className="flex items-center space-x-1">
                    <label htmlFor="units" className="text-sm font-medium text-gray-700 dark:text-gray-200">Units:</label>
                    <select onChange={onChangeUnit} className="w-20 text-sm border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500" >
                        <option value="imperial">imperial inch</option>
                        <option value="nautical">nautical mile</option>
                        <option value="metric" selected>metric</option>
                    </select>
                </div>
                <button onClick={handleZoomIn} className="px-2 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full">{DarkModeIcon("w-5", zoomInIconUrl)}</button>
                <button onClick={handleZoomOut} className="px-2 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full">{DarkModeIcon("w-5", zoomOutIconUrl)}</button>
                <button onClick={handleUndo} className="px-2 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full">{DarkModeIcon("w-5", undoIconUrl)}</button>
                <button onClick={handleFullscreen} className="px-2 py-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full">{DarkModeIcon("w-5", fullscreenIcon)}</button>
            </div>
        </>
    );
};

export default MapWithDrawSupport;
