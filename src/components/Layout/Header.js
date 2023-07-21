import React from "react"
import { Link } from "react-router-dom"
import './styles.css'

const Header = () => {
    return (
        <div>
            <header className="flex space-between">
       
                <div id="header-nav">
                         <Link to="/"><span>Watchlist</span></Link>
                         <Link to="/reports"><span>Chart</span></Link>
                         <Link to="/gauges"><span>News</span></Link>
                </div> 

                <div id="logo">
                    <h1>
                       Old-Well Labs
                    </h1>
                </div>
            </header>

        </div>
    );
}

export { Header as default }