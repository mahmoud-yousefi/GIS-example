import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <Link className="block" to={'/GIS-example/openlayers'}>OpenLayers</Link>
            <Link className="block" to={'/GIS-example/MapWith3DModels'}>MapWith3DModels</Link>
            <Link className="block" to={'/GIS-example/maplibre'}>MapLibre</Link>
            <Link className="block" to={'/GIS-example/Mapbox'}>Mapbox</Link>
        </>
    )
}

export default Home


