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
import fullscreenIcon from '@material-symbols/svg-400/outlined/fullscreen.svg';
import { Polygon } from 'ol/geom';
import { get } from 'ol/proj';
import { Control, FullScreen, MousePosition, ScaleLine } from 'ol/control'
import { createStringXY } from 'ol/coordinate';
import { defaults as defaultControls } from 'ol/control.js'
import proj4 from 'proj4';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';
import { Units } from 'ol/control/ScaleLine';

proj4.defs('EPSG:32632', '+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');

const DarkModeIcon = (className: string, iconURL: string) => {
    return <img src={iconURL} className={className} alt="Dark Mode Icon" />;
};

const AccessibleMap = () => {
    const [map, setMap] = useState<Map | null>(null);
    const [draw, setDraw] = useState<Draw | null>(null);
    // const [snap, setSnap] = useState<Snap | null>(null);
    // const [modify, setModify] = useState<Modify | null>(null)
    const [typeSelect, setTypeSelect] = useState<string>('None');
    const [featureSource] = useState<VectorSource>(new VectorSource({ wrapX: false }));
    const [source] = useState<OSM | undefined>(new OSM());

    const shapesColor: {
        'Point'?: string;
        'LineString'?: string;
        'Polygon'?: string;
        'Circle'?: string;
    } = {
        'Point': 'rgba(100,255,0,0.4)',
        'LineString': 'rgba(200, 178, 0, 0.6)',
        'Polygon': 'rgba(100, 255, 0, 0.6)',
        'Circle': 'rgba(253, 165, 220, 0.6)'
    }

    const styles: {
        'Point'?: StyleLike | FlatStyleLike;
        'LineString'?: StyleLike | FlatStyleLike;
        'Polygon'?: StyleLike | FlatStyleLike;
        'Circle'?: StyleLike | FlatStyleLike;
    } = {
        'Point': {
            'fill-color': shapesColor.Point,
            'stroke-color': 'purple',
            'stroke-width': 2,
            "circle-fill-color": 'purple',
            "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        },
        'LineString': {
            'fill-color': shapesColor.LineString,
            'stroke-color': 'purple',
            'stroke-width': 2,
            "circle-fill-color": 'purple',
            "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        },
        'Polygon': {
            'fill-color': shapesColor.Polygon,
            'stroke-color': 'purple',
            'stroke-width': 2,
            "circle-fill-color": 'purple',
            "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        },
        'Circle': {
            'fill-color': shapesColor.Circle,
            'stroke-color': 'purple',
            'stroke-width': 2,
            'text-stroke-width': 3,
            "circle-fill-color": 'purple',
            "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        },
    };

    const SelectStyles = {
        style: new Style({
            image: new Circle({
                fill: new Fill({
                    color: shapesColor.LineString,
                }),
                stroke: new Stroke({
                    color: 'purple',
                    width: 2,
                }),
                radius: 5,
            }),
            fill: new Fill({
                color: shapesColor.LineString,
            }),
            stroke: new Stroke({
                color: 'purple',
                width: 2,
            }),
        }),
    }

    const [select, setSelect] = useState<Select>(new Select(SelectStyles));
    const [translate, setTranslate] = useState<Translate>(new Translate({
        features: select?.getFeatures(),
    }));

    const fullscreenRef = useRef<HTMLDivElement | null>(null);
    
    const [mousePositionControl, setMousePositionControl] = useState<MousePosition>(new MousePosition({
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
        style: {
            'fill-color': 'rgba(100, 255, 0, 0.6)',
            'stroke-color': 'purple',
            'stroke-width': 2,
            "circle-fill-color": 'purple',
            "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        }
    });

    const [newSnap] = useState(new Snap({ source: featureSource, }));
    map?.addInteraction(newSnap);

    const newModify = new Modify({
        source: featureSource, style: {
            // 'fill-color': 'rgba(100, 255, 0, 0.6)',
            'stroke-color': 'purple',
            // 'stroke-width': 0.5,
            // "circle-fill-color": 'purple',
            // "circle-radius": 6,
            'circle-stroke-color': 'rgba(100, 255, 0, 0.9)'
        }
    });
    map?.addInteraction(newModify);

    // useEffect(() => {
    //     const utmProjection = get('EPSG:32632');
    //     const mapProjection = map?.getView().getProjection();
    //     const mousePosition = new MousePosition({
    //       coordinateFormat: (coordinate) => {
    //         const utmCoordinate = transform(coordinate, mapProjection, utmProjection);
    //         return createStringXY(4)(utmCoordinate);
    //       },
    //     });
    //     setMousePositionControl(mousePosition);
    //     map?.addControl(mousePosition);
    //   }, []);

    const [units, setUnits] = useState<Units>('metric');
    const [typeScaleSelect, setTypeScaleSelect] = useState<string>('scaleline');
    const [steps, setSteps] = useState(4);
    const [showScaleText, setShowScaleText] = useState(true);
    // const [invertColors, setInvertColors] = useState(false);
    const [control, setControl] = useState<Control>(new ScaleLine({ units }));
    const [fullScreen, setFullScreen] = useState(false);

    useEffect(() => {
        if (map) {
            // Remove the previous control
            map.removeControl(control);
        }
        const newControl = scaleControl();
        setControl(newControl);
        if (map) {
            map.addControl(newControl);
        }
    }, [map, units, typeScaleSelect, steps, showScaleText,/* invertColors*/]);

    const scaleControl = () => {
        if (typeScaleSelect === 'scaleline') {
            return new ScaleLine({ units, minWidth: 140 });
        } else {
            return new ScaleLine({
                units,
                bar: true,
                steps,
                text: showScaleText,
                minWidth: 200,
            });
        }
    };

    const onChangeUnit = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUnits(event.target.value as Units);
    };

    const onTypeScaleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setTypeScaleSelect(event.target.value);
    };

    const onStepsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSteps(parseInt(event.target.value));
    };

    const onShowScaleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowScaleText(event.target.checked);
    };

    // const onInvertColorsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //   setInvertColors(event.target.checked);
    //   if (control) {
    //     control.element.classList.toggle('ol-scale-bar-inverted', invertColors);
    //   }
    // };

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
                trace: true,
                traceSource: featureSource,
                style: styles[value as keyof typeof styles],
                geometryFunction: geometryFunction as GeometryFunction,
                // freehand: true
            });
            map?.addInteraction(newDraw);

            setDraw(newDraw);
        }
    };

    useEffect(() => {
        const extent = get('EPSG:32632')?.getExtent().slice();
        if (extent) {
            extent[0] += extent[0];
            extent[2] += extent[2];
        }

        const newMap = new Map({
            controls: defaultControls().extend([mousePositionControl]),
            interactions: defaultInteractions().extend([select, translate]),
            layers: [raster, vector],
            target: 'map',
            view: new View({
                // center: [-11000000, 4600000],
                center: [0, 0],
                // zoom: 4,
                zoom: 2,
            }),
        });

        setMap(newMap);

        if(fullscreenRef.current){
            const fullScreenControl = new FullScreen({
                className: 'custom-full-screen',
                target: fullscreenRef.current
              });
            newMap.addControl(fullScreenControl);
        }

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

    const handleType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setTypeSelect(e.currentTarget.value);
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
            <div className='flex'>
                <div >
                    <form className='flex my-2'>
                        <label htmlFor="projection" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Projection </label>
                        <select onChange={handleProjectionSelect} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2">
                            <option value="EPSG:4326">EPSG:4326</option>
                            <option value="EPSG:3857">EPSG:3857</option>
                            <option value="EPSG:32632">EPSG:32632</option>
                        </select>
                        <label htmlFor="precision" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Precision</label>
                        <input onChange={event => handlePrecision(event)} className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 block w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' type="number" min={0} max="12" defaultValue={4} />
                    </form>

                    <div className="flex flex-wrap">
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
                        <div className='mx-1'  ref={fullscreenRef}></div>
                    </div>
                </div>
                <div className='px-2'>
                    <form className='my-2 text-left'>
                        <label htmlFor="units" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Units:</label>
                        <select onChange={onChangeUnit} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 w-24 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2" >
                            <option value="degrees">degrees</option>
                            <option value="imperial">imperial inch</option>
                            <option value="us">us inch</option>
                            <option value="nautical">nautical mile</option>
                            <option value="metric" selected>metric</option>
                        </select>

                        <label htmlFor="type" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Type:</label>
                        <select id="type"
                            value={typeScaleSelect}
                            onChange={onTypeScaleSelectChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-e-lg border-s-gray-100 dark:border-s-gray-700 border-s-2 focus:ring-blue-500 focus:border-blue-500 w-fit p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mr-2"
                        >
                            <option value="scaleline">ScaleLine</option>
                            <option value="scalebar">ScaleBar</option>
                        </select>
                        {
                            typeScaleSelect === 'scalebar' && (
                                <div className='my-2 flex'>
                                    <label htmlFor="steps" className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-500 bg-gray-100 border border-gray-300 rounded-s-lg focus:ring-4 focus:outline-none focus:ring-gray-100 dark:bg-gray-700 dark:focus:ring-gray-700 dark:text-white dark:border-gray-600">Steps:</label>
                                    <input className='ml-2' id="steps"
                                        onChange={onStepsChange}
                                        value={steps} type="range"
                                        defaultValue={4}
                                        min={1}
                                        max={8}
                                    />

                                    <span className='flex flex-col'>
                                        <label className='ml-2'><input type="checkbox"
                                            checked={showScaleText}
                                            onChange={onShowScaleTextChange}
                                        /> Show scale text</label>

                                        {/* <label className='ml-2'><input type="checkbox" id="invertColors"
                                            checked={invertColors}
                                            onChange={onInvertColorsChange}
                                        /> Invert colors</label> */}
                                    </span>
                                </div>
                            )
                        }
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccessibleMap;