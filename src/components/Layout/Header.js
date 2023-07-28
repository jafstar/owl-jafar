import React from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { atom, selector, DefaultValue, useRecoilState } from "recoil";
import { addHistory, getHistory } from "../../utils/db";

// import {
//   SEARCH_QUERY_AAPL,
//   SEARCH_QUERY_GOOG,
//   SEARCH_QUERY_IBM,
// } from "../../../mockdata/SEARCH_QUERY";
import { fetchData } from "../../utils/fetch";
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
  const [showList, setShowList] = React.useState(false);
  const [historyList, setHistoryList] = React.useState([]);

  /**
   * @name searchInput
   * @param {String} tmpInput
   */
  const searchInput = async (tmpInput = inputRef.current.value) => {
    const currentInputVal = tmpInput;
    if (!currentInputVal) {
      toast.error("Please enter a stock symbol");
      return;
    }
    setIsLoading(true);
    setShowList(false);

    toast.loading("Waiting...");

    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currentInputVal}&apikey=${API_KEY}`;
    // const getData = await fetch(url);
    // const resp = await getData.json();
    const resp = await fetchData(url, {
      symbol: currentInputVal.toLocaleLowerCase(),
    });
    // MOCK DATA
    // const resp = await new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     switch (currentInputVal.toLocaleLowerCase()) {
    //       case "aapl":
    //         resolve(SEARCH_QUERY_AAPL);
    //         break;
    //       case "goog":
    //         resolve(SEARCH_QUERY_GOOG);
    //         break;
    //       case "ibm":
    //         resolve(SEARCH_QUERY_IBM);
    //         break;
    //       default:
    //         reject(null);
    //     }
    //   }, 250);
    // }).catch((err) => {
    //   console.log(err);
    // });

    setIsLoading(false);
    toast.remove();

    if (!resp || !resp.bestMatches) {
      // Toast
      toast.error(`No matches for ${currentInputVal} ...`);
    }

    if (resp.bestMatches.length) {
      const selectedSymbol = resp.bestMatches[0]; // resp.bestMatches[0]["1. symbol"];
      setCurrentSymbol(selectedSymbol);

      let tmpHandHistory = {
        id: Date.now(),
        stock: selectedSymbol["1. symbol"],
      };

      addHistory(tmpHandHistory);
    } else {
      toast.error("No symbol found");
    }
  };

  /**
   * @name handleOnFocus
   * @type EventFunc
   */
  const handleOnFocus = async () => {
    // console.log("on focus...");
    setShowList(true);
    const tmpList = await getHistory();
    console.log("tmpList: ", tmpList);
    setHistoryList([...tmpList]);
  };

  /**
   * @name handleOnBlur
   * @type EventFunc
   * @param {Event} e
   */
  const handleOnBlur = (e) => {
    // console.log("on blur...", e);
    if (!e.target.className.includes("search-field")) {
      setShowList(false);
    }
  };

  const handleOnKeyDown = (e) => {
    if (e.keyCode === 13) {
      console.log("enter key...");
      if (inputRef.current.value !== "") {
        searchInput(inputRef.current.value);
      }
    }
  };

  /**
   * @name handleListClick
   * @type EventFunc
   * @param {String} tmpSymbol
   */
  const handleListClick = (tmpSymbol) => {
    searchInput(tmpSymbol);
  };

  /**
   * @name showList
   * @type EffectFunc
   */
  React.useEffect(() => {
    if (showList) {
      window.addEventListener("click", handleOnBlur);
    } else {
      window.removeEventListener("click", handleOnBlur);
    }
  }, [showList]);

  /**
   * @name componentMounted
   * @type EffectFunc
   */
  React.useEffect(() => {
    // setCurrentSymbol("GOOG");
    searchInput("AAPL");
  }, []);

  return (
    <div>
      <header className="flex space-between">
        <div className="flex">
          <div id="logo">
            <Link to="/">
              <img src="/images/owl-icon-64.png" alt="owl logo" />
              <h1>OWL</h1>
            </Link>
          </div>
        </div>

        <div>
          <div className="search-box search-field ">
            <input
              ref={inputRef}
              type="search"
              name="input-symbol"
              className="search-field field input-text"
              placeholder="Search..."
              onFocus={() => handleOnFocus()}
              onBlur={(e) => handleOnBlur(e)}
              onKeyDown={(e) => handleOnKeyDown(e)}
              defaultValue={currentSymbol["1. symbol"]}
            />
            <button className="search-field" onClick={() => searchInput()}>
              {isLoading ? (
                <i className="gg-spinner-two"></i>
              ) : (
                <i className="gg-search"></i>
              )}
            </button>
            {showList && historyList.length && (
              <div className="search-list search-field">
                <ul>
                  {historyList.map((itm, idx) => {
                    const stockSymbol = String(itm.stock).toUpperCase();
                    return (
                      <li
                        onClick={() => handleListClick(stockSymbol)}
                        key={`search-list-itm-${idx}`}
                      >
                        {stockSymbol}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* <div id="header-nav">
          <Link to="/">
            <span>Watchlist</span>
          </Link>
          <Link to="/chart">
            <span>Chart</span>
          </Link>
          <Link to="/news">
            <span>News</span>
          </Link>
        </div> */}
      </header>
    </div>
  );
};

export { Header as default };
