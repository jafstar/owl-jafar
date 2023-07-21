import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  atom,
  selector,
  DefaultValue,
  useRecoilValue,
  useResetRecoilState,
  useRecoilState,
} from "recoil";

import "./styles.css";

const API_KEY = process.env.ALPHAVANTAGE_API;

/**
 * Search Input
 * keeps track of the search input
 *  */
export const atomCurrentSymbol = atom({
  key: "atomCurrentSymbol", // unique ID
  default: "GOOG", // default value
});

export const selectorCurrentSymbol = selector({
  key: "selectorCurrentSymbol",
  get: ({ get }) => get(atomCurrentSymbol),
  set: ({ set }, newValue) =>
    set(atomCurrentSymbol, newValue instanceof DefaultValue ? newValue : null),
});

const Header = () => {
  const inputRef = React.useRef();

  const [currentSymbol, setCurrentSymbol] = useRecoilState(atomCurrentSymbol);

  const [isLoading, setIsLoading] = React.useState(null);

  const SearchInput = async () => {
    setIsLoading(true);
    toast.loading("Waiting...");
    const currentInputVal = inputRef.current.value;

    console.log("searching new symbol: ", currentInputVal);
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currentInputVal}&apikey=${API_KEY}`;
    const getData = await fetch(url);
    const resp = await getData.json();
    console.log("resp: ", resp);

    if (resp.bestMatches.length) {
      const selectedSymbol = resp.bestMatches[0]["1. symbol"];
      console.log(selectedSymbol);
      setCurrentSymbol(selectedSymbol);
    } else {
      toast.error("No symbol found");
    }

    setIsLoading(false);
    toast.remove();
  };

  return (
    <div>
      <header className="flex space-between">
        <div>
          <div id="logo">
            <h1>Old-Well Labs</h1>
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
              defaultValue={currentSymbol}
              //   value={inputSearch}
              //   onChange={(evt) => setInputSearch(evt.target.value)}
            />
            <button onClick={() => SearchInput()}>Search</button>
          </div>
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
      </header>
    </div>
  );
};

export { Header as default };
