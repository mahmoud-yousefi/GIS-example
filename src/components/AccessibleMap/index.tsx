import { GeometryFunction, createBox, createRegularPolygon } from 'ol/interaction/Draw';
import { Draw, Modify, Select, Snap, Translate, defaults as defaultInteractions } from 'ol/interaction';
import Map from 'ol/Map';
import View from 'ol/View';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import './index.css'
import { RefObject, useEffect, useRef, useState } from 'react';
import { Type } from 'ol/geom/Geometry';
import zoomOutIconUrl from '@material-symbols/svg-400/outlined/zoom_out.svg';
import zoomInIconUrl from '@material-symbols/svg-400/outlined/zoom_in.svg';
import undoIconUrl from '@material-symbols/svg-400/outlined/undo.svg';
import { Polygon } from 'ol/geom';
import { get } from 'ol/proj';
import { MousePosition } from 'ol/control'
import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control.js'

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

    const mousePosition = useRef(null)

    const [mousePositionControl] = useState<MousePosition>(new MousePosition({
        coordinateFormat: createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        // target: mousePosition.current ?? undefined,
    }))

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

        if(mousePosition.current){
            mousePositionControl.setTarget(mousePosition.current)
        }

        const newMap = new Map({
            controls: defaultControls().extend([mousePositionControl]),
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

    const handleProjectionSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
        mousePositionControl.setProjection(event.target.value);
    }

    const handlePrecision = (event: React.ChangeEvent<HTMLInputElement>) => {
        const format = createStringXY(event.target.valueAsNumber);
        mousePositionControl.setCoordinateFormat(format);
    }

    return (
        <div>
            <a className="skiplink" href="#map">Go to map</a>
            <div id="map" className="map mb-2" tabIndex={0}></div>
            <div ref={mousePosition} className='block'></div>
            <form className='flex mx-3 my-2'>
                <label htmlFor="projection" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Projection </label>
                <select onChange={handleProjectionSelect} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2">
                    <option value="EPSG:4326">EPSG:4326</option>
                    <option value="EPSG:3857">EPSG:3857</option>
                </select>
                <label htmlFor="precision" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Precision</label>
                <input onChange={event => handlePrecision(event)} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' type="number" min={0} max="12" defaultValue={4} />
            </form>
            <div className="flex flex-wrap mx-3">
                <span className="flex items-center">
                    <label className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600" htmlFor="type">Geometry type:</label>
                    <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={handleType} value={typeSelect}>
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