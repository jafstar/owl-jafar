import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import { initJsStore } from "./storage/service/_idb";

import "./styles/__core__.css";
import App from "./App";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <RecoilRoot>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </RecoilRoot>
);

initJsStore();
