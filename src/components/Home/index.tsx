import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <Link className="block" to={'/openlayers'}>OpenLayers</Link>
            <Link className="block" to={'/MapWith3DModels'}>MapWith3DModels</Link>
            <Link className="block" to={'/maplibre'}>MapLibre</Link>
            <Link className="block" to={'/Mapbox'}>Mapbox</Link>
        </>
    )
}

export default Home


