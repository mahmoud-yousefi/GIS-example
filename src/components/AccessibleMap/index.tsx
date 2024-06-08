import { GeometryFunction, createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { Draw, Modify, Select, Snap, Translate, defaults as defaultInteractions } from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import './index.css'
import { useEffect, useState } from 'react';
import { Type } from 'ol/geom/Geometry';
import zoomOutIconUrl from '@material-symbols/svg-400/outlined/zoom_out.svg';
import zoomInIconUrl from '@material-symbols/svg-400/outlined/zoom_in.svg';
import undoIconUrl from '@material-symbols/svg-400/outlined/undo.svg';
import { Polygon } from 'ol/geom';
import { get } from 'ol/proj';
// import { GeometryFunction } from 'ol/style/Style';

const DarkModeIcon = (className: string, iconURL: string) => {
    return <img src={iconURL} className={className} alt="Dark Mode Icon" />;
};

const AccessibleMap = () => {
    const [map, setMap] = useState<Map | null>(null);
    const [draw, setDraw] = useState<Draw | null>(null);
    // const [snap, setSnap] = useState<Snap | null>(null);
    // const [modify, setModify] = useState<Modify | null>(null)
    // const [select, setSelect] = useState<Select>(new Select());
    // const [translate, setTranslate] = useState<Translate>(new Translate({ features: select?.getFeatures(), }));
    const [typeSelect, setTypeSelect] = useState<string>('None');
    const [featureSource] = useState<VectorSource>(new VectorSource({ wrapX: false }));
    const [source] = useState<OSM | undefined>(new OSM());

    const raster = new TileLayer({
        source: source,
    });

    const vector = new VectorLayer({
        source: featureSource,
    });

    const addInteraction = () => {
        let value = typeSelect;
        if (value !== 'None') {
            let geometryFunction;
            if (value === 'Square') {
                value = 'Circle';
                geometryFunction = createRegularPolygon(4);
            } else if (value === 'Box') {
                value = 'Circle';
                geometryFunction = createBox();
            } else if (value === 'Star') {
                value = 'Circle';
                geometryFunction = (coordinates: number[][], geometry: Polygon) => {
                    const center = coordinates[0];
                    const last = coordinates[coordinates.length - 1];
                    const dx = center[0] - last[0];
                    const dy = center[1] - last[1];
                    const radius = Math.sqrt(dx * dx + dy * dy);
                    const rotation = Math.atan2(dy, dx);
                    const newCoordinates = [];
                    const numPoints = 12;
                    for (let i = 0; i < numPoints; ++i) {
                        const angle = rotation + (i * 2 * Math.PI) / numPoints;
                        const fraction = i % 2 === 0 ? 1 : 0.5;
                        const offsetX = radius * fraction * Math.cos(angle);
                        const offsetY = radius * fraction * Math.sin(angle);
                        newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                    }
                    newCoordinates.push(newCoordinates[0].slice());
                    if (!geometry) {
                        geometry = new Polygon([newCoordinates]);
                    } else {
                        if (geometry instanceof Polygon) {
                            geometry.setCoordinates([newCoordinates]);
                        }
                    }
                    return geometry;
                };
            }
            const newDraw = new Draw({
                source: featureSource,
                type: value as Type,
                geometryFunction: geometryFunction as GeometryFunction,
                // freehand: true
            });
            map?.addInteraction(newDraw);
            const newSnap = new Snap({ source: featureSource });

            map?.addInteraction(newSnap);

            const newModify = new Modify({ source: featureSource });
            map?.addInteraction(newModify);

            setDraw(newDraw);
        }
    };

    useEffect(() => {
        // setFeatureSource(new VectorSource({ wrapX: false }))
        // setSource(new OSM())
        const extent = get('EPSG:3857')?.getExtent().slice();
        if (extent) {
            extent[0] += extent[0];
            extent[2] += extent[2];
        }

        const select = new Select();

        const translate = new Translate({
            features: select.getFeatures(),
        });
        
        const newMap = new Map({
            interactions: defaultInteractions().extend([select, translate]),
            layers: [raster, vector],
            target: 'map',
            view: new View({
                center: [-11000000, 4600000],
                zoom: 4,
            }),
        });

        setMap(newMap);

        return () => {
            newMap.setTarget(undefined);
        };
    }, []);

    useEffect(() => {
        if (map) {
            if (draw) {
                map.removeInteraction(draw);
            }

            addInteraction()
        }
    }, [typeSelect]);

    const handleZoomOut = () => {
        if (map) {
            const view = map.getView();
            const zoom = view.getZoom();
            view.setZoom(zoom ? zoom - 1 : 1);
        }
    };

    const handleZoomIn = () => {
        if (map) {
            const view = map.getView();
            const zoom = view.getZoom();
            view.setZoom(zoom ? zoom + 1 : 1);
        }
    };

    const handleType = (val: React.ChangeEvent<HTMLSelectElement>) => {
        setTypeSelect(val.currentTarget.value);
        draw ? map?.removeInteraction(draw) : null;
        // snap ? map?.removeInteraction(snap) : null;
    };

    const handleUndo = () => {
        if (draw) {
            draw.removeLastPoint();
        }
    };

    return (
        <div>
            <a className="skiplink" href="#map">Go to map</a>
            <div id="map" className="map mb-2" tabIndex={0}></div>
            <div className="flex flex-wrap mx-3">
                <span className="flex items-center">
                    <label className="text-sm font-medium text-gray-700 w-32 mx-1" htmlFor="type">Geometry type:</label>
                    <select className="block text-sm text-gray-700 rounded-sm" onChange={handleType} value={typeSelect}>
                        <option value="Point">Point</option>
                        <option value="LineString">LineString</option>
                        <option value="Polygon">Polygon</option>
                        <option value="Circle">Circle</option>
                        <option value="Square">Square</option>
                        <option value="Box">Box</option>
                        <option value="Star">Star</option>
                        <option value="None">None</option>
                    </select>
                </span>
                <button className="mx-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded-full" type="button" onClick={handleUndo}>{DarkModeIcon("w-5", undoIconUrl)}</button>
                <button className='mx-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded-full' onClick={handleZoomOut}>{DarkModeIcon("w-5", zoomOutIconUrl)}</button>
                <button className='mx-1 bg-blue-500 hover:bg-blue-700 text-white py-2 px-2 rounded-full' onClick={handleZoomIn}>{DarkModeIcon("w-5", zoomInIconUrl)}</button>
            </div>
        </div>
    );
};

export default AccessibleMap;