import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Layout from "./components/Layout";

import Home from "./pages/home";
// import Reports from './pages/reports'
import Err404 from "./pages/err404";
import News from "./pages/news";

const App = () => {
  return (
    <>
      <div id="app-shell">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="news" element={<News />} />
            {/* <Route path="reports" element={<Reports />} />
                         <Route path="gauges" element={<GaugeTests />} /> */}
            <Route path="*" element={<Err404 />} />
            <Route index element={<Home />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </>
  );
};

export { App as default };
