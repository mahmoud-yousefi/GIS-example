import { Link } from "react-router-dom"

const Home = () => {
    return (
        <>
            <Link className="block" to={'/accessible-map'}>AccessibleMap</Link>
            <Link className="block" to={'/advanced-mapbox-vector-titles'}>AdvancedMapboxVectorTiles</Link>
        </>
    )
}

export default Home


