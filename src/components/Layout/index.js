import React from "react"
import {
    Outlet,
    Link
} from "react-router-dom"


import Header from "./Header";
import Footer from "./Footer";


const Layout = () => {
    return (
        <>
            <Header />

            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}

export { Layout as default }