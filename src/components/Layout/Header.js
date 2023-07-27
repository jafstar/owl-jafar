import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { atom, selector, DefaultValue, useRecoilState } from "recoil";

import {
  SEARCH_QUERY_AAPL,
  SEARCH_QUERY_GOOG,
  SEARCH_QUERY_IBM,
} from "../../../mockdata/SEARCH_QUERY";
import "./styles.css";

const API_KEY = process.env.ALPHAVANTAGE_API;

/**
 * Search Input
 * keeps track of the search input
 *  */
export const atomCurrentSymbol = atom({
  key: "atomCurrentSymbol", // unique ID
  default: "", // default value
});

export const selectorCurrentSymbol = selector({
  key: "selectorCurrentSymbol",
  get: ({ get }) => get(atomCurrentSymbol),
  set: ({ set }, newValue) =>
    set(atomCurrentSymbol, newValue instanceof DefaultValue ? newValue : null),
});

const Header = () => {
  // REFs
  const inputRef = React.useRef();

  // Store State
  const [currentSymbol, setCurrentSymbol] = useRecoilState(atomCurrentSymbol);

  // Local State
  const [isLoading, setIsLoading] = React.useState(null);

  const SearchInput = async (tmpInput = inputRef.current.value) => {
    const currentInputVal = tmpInput;

    setIsLoading(true);
    toast.loading("Waiting...");

    /*
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currentInputVal}&apikey=${API_KEY}`;
    const getData = await fetch(url);
    const resp = await getData.json();
    */
    // MOCK DATA
    const resp = await new Promise((resolve, reject) => {
      setTimeout(() => {
        switch (currentInputVal.toLocaleLowerCase()) {
          case "aapl":
            resolve(SEARCH_QUERY_AAPL);
            break;
          case "goog":
            resolve(SEARCH_QUERY_GOOG);
            break;
          case "ibm":
            resolve(SEARCH_QUERY_IBM);
            break;
          default:
            reject(null);
        }
      }, 2000);
    });

    setIsLoading(false);
    toast.remove();

    if (resp.bestMatches.length) {
      const selectedSymbol = resp.bestMatches[0]; // resp.bestMatches[0]["1. symbol"];
      setCurrentSymbol(selectedSymbol);
    } else {
      toast.error("No symbol found");
    }
  };

  React.useEffect(() => {
    // setCurrentSymbol("GOOG");
    SearchInput("AAPL");
  }, []);

  return (
    <div>
      <header className="flex space-between">
        <div className="flex">
          <div id="logo">
            <h1>Old-Well Labs</h1>
          </div>

          <div id="header-nav">
            <Link to="/">
              <span>Watchlist</span>
            </Link>
            <Link to="/reports">
              <span>Chart</span>
            </Link>
            <Link to="/gauges">
              <span>News</span>
            </Link>
          </div>
        </div>

        <div>
          <div className="search-box">
            {isLoading && <i className="gg-spinner-two"></i>}
            <input
              ref={inputRef}
              type="search"
              name="input-symbol"
              className="field input-text"
              placeholder="symbol"
              defaultValue={currentSymbol["1. symbol"]}
            />
            <button onClick={() => SearchInput()}>Search</button>
          </div>
        </div>
      </header>
    </div>
  );
};

export { Header as default };
