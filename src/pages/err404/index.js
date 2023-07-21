import React from "react"
import { Link } from "react-router-dom"

const Err404 = () => {
    return (
        <div>
            <h2>404</h2>
            <p>Page Not Found</p>
            <p>
                <Link to="/">Go to the home page</Link>
            </p>
        </div>
    );
}

export { Err404 as default }