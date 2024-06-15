import MVT from 'ol/format/MVT.js';
import Map from 'ol/Map.js';
import TileGrid from 'ol/tilegrid/TileGrid.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import View from 'ol/View.js';
import { Fill, Icon, Stroke, Style, Text } from 'ol/style.js';
import { get as getProjection } from 'ol/proj.js';
import './index.css'
import { useEffect, useState } from 'react';


const AdvancedMapboxVectorTiles = () => {
    const [map, setMap] = useState<Map | null>(null);

    const key =
        'Your Mapbox access token from https://mapbox.com/ here';

    // Calculation of resolutions that match zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
    const resolutions: number[] = [];
    for (let i = 0; i <= 8; ++i) {
        resolutions.push(156543.03392804097 / Math.pow(2, i * 2));
    }
    // Calculation of tile urls for zoom levels 1, 3, 5, 7, 9, 11, 13, 15.
    function tileUrlFunction(tileCoord: number[]) {
        return (
            'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
            '{z}/{x}/{y}.vector.pbf?access_token=' +
            key
        )
            .replace('{z}', String(tileCoord[0] * 2 - 1))
            .replace('{x}', String(tileCoord[1]))
            .replace('{y}', String(tileCoord[2]))
            .replace(
                '{a-d}',
                'abcd'.substr(((tileCoord[1] << tileCoord[0]) + tileCoord[2]) % 4, 1),
            );
    }

    useEffect(() => {
        const newMap = new Map({
            layers: [
                new VectorTileLayer({
                    source: new VectorTileSource({
                        attributions:
                            '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
                            '© <a href="https://www.openstreetmap.org/copyright">' +
                            'OpenStreetMap contributors</a>',
                        format: new MVT(),
                        tileGrid: new TileGrid({
                            extent: getProjection('EPSG:3857')?.getExtent(),
                            resolutions: resolutions,
                            tileSize: 512,
                        }),
                        tileUrlFunction: tileUrlFunction,
                    }),
                    style: createMapboxStreetsV6Style(Style, Fill, Stroke, Icon, Text),
                }),
            ],
            target: 'map',
            view: new View({
                center: [0, 0],
                minZoom: 1,
                zoom: 2,
            }),
        });
        setMap(newMap);

        return () => {
            newMap.setTarget(undefined);
        };
    }, [])

    return (
        <div id="map" className="map"></div>
    )
}

export default AdvancedMapboxVectorTiles