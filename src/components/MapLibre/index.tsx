import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './index.css'

const MapWithDrawSupport: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const squareRef = useRef<HTMLDivElement>(null);
    const [mouseCoordinates, setMouseCoordinates] = useState({
        point: { x: 0, y: 0 },
        lngLat: { lng: 0, lat: 0 },
    });
    const [area, setArea] = useState<number | null>(null);
    const [map, setMap] = useState<maplibregl.Map | null>(null);
    const [draw, setDraw] = useState<MapboxDraw | null>(null);

    useEffect(() => {
        const initializeMap = () => {
            const initializedMap = new maplibregl.Map({
                container: mapContainerRef.current!,
                style: 'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
                center: [-91.874, 42.76],
                zoom: 12,
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
        const answer = squareRef.current;
        if (data.features.length > 0) {
            const area = turf.area(data);
            const roundedArea = Math.round(area * 100) / 100;
            setArea(roundedArea);
        } else {
            setArea(null);
            if (answer) answer.innerHTML = '';

            if (e.type !== 'draw.delete') {
                alert('Use the draw tools to draw a polygon!');
            }
        }
    };

    return (
        <div className="relative h-screen" id='map'>
            <div ref={mapContainerRef} className="w-full h-full" />
            <pre className="block absolute top-0 left-[25%] w-1/2 p-2 font-bold border-none rounded text-sm text-center text-[#414040]">
                {`${JSON.stringify(mouseCoordinates.point)}\n${JSON.stringify(mouseCoordinates.lngLat)}`}
            </pre>
            <div className="absolute bottom-10 left-4 bg-white bg-opacity-90 p-4 rounded shadow-md text-center text-sm h-28 w-48">
                <p>Draw a polygon using the draw tools.</p>
                <div ref={squareRef}>
                    {area !== null ? (
                        <>
                            <p><strong>{area}</strong></p>
                            <p>square meters</p>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default MapWithDrawSupport;
