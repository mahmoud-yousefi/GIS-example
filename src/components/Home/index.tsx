import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <Link className="block" to={'/openlayers'}>OpenLayers</Link>
            <Link className="block" to={'/maplibre'}>MapLibre</Link>
        </>
    )
}

export default Home


