import React from "react";
import { createChart } from "lightweight-charts";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { DateTime } from "luxon";

import {
  API_KEY,
  _WIDTH_RATIO,
  _HEIGHT,
  _COLOR_UP,
  _COLOR_DOWN,
  _COLOR_VOLUME,
  _COLOR_AREA,
} from "../../constants";
import { formatAPIData } from "../../utils/format";
import { atomCurrentSymbol } from "../../components/Layout/Header";
import { fetchData } from "../../utils/fetch";
import "./styles.css";

const chartOptions = {
  layout: {
    textColor: "#ccc",
    background: {
      type: "solid",
      color: "#111",
    },
  },
  grid: {
    vertLines: { color: "#222" },
    horzLines: { color: "#222" },
  },
  rightPriceScale: {
    borderVisible: false,
  },
  localization: {
    dateFormat: "yyyy-MM-dd",
  },
};

const Home = () => {
  // Refs
  const chartRef = React.useRef({
    api() {
      if (!this._api) {
        // console.log("new chart created...");
        this._api = createChart(
          document.getElementById("chartContainer"),
          chartOptions
        );

        this.addSeriesCandlestick();
        this.addSeriesArea();
        this.addSeriesVolume();

        // this._api.timeScale().fitContent();
      }
      return this._api;
    },
    free() {
      if (this._api) {
        // this._api.removeSeries(this._seriesArea);
        // this._api.removeSeries(this._seriesCandle);
        // this._api.removeSeries(this._seriesVolume);
        // this._api.remove();
        // this._api = undefined;
      }
    },
    removeSeries(series) {
      if (this._api) {
        this._api.removeSeries(series);
      }
    },
    addSeriesCandlestick() {
      // Series - Candlestick
      if (!this._seriesCandle) {
        this._seriesCandle = this._api.addCandlestickSeries({
          upColor: "transparent",
          downColor: "transparent",
          borderVisible: false,
          wickUpColor: "transparent",
          wickDownColor: "transparent",
        });
      }
      return this._seriesCandle;
    },
    seriesCandle() {
      return this._seriesCandle ? this._seriesCandle : null;
    },
    addSeriesArea() {
      // Series - Candlestick
      if (!this._seriesArea) {
        // Series - Area
        this._seriesArea = this._api.addAreaSeries({
          topColor: "transparent",
          bottomColor: "rgba(41, 98, 255, 0)",
          lineColor: "transparent",
          lineWidth: 2,
        });
        this._seriesArea.priceScale().applyOptions({
          scaleMargins: {
            top: 0.1,
            bottom: 0.4,
          },
        });
      }
      return this._seriesArea;
    },
    seriesArea() {
      return this._seriesArea ? this._seriesArea : null;
    },
    addSeriesVolume() {
      if (!this._seriesVolume) {
        // Series - Volume
        this._seriesVolume = this._api.addHistogramSeries({
          color: _COLOR_VOLUME,
          priceFormat: {
            type: "volume",
          },
          priceScaleId: "",
          scaleMargins: {
            top: 0.7,
            bottom: 0,
          },
        });
        this._seriesVolume.priceScale().applyOptions({
          scaleMargins: {
            top: 0.7,
            bottom: 0,
          },
        });
      }
      return this._seriesVolume;
    },
    seriesVolume() {
      return this._seriesVolume ? this._seriesVolume : null;
    },
  });

  // State Store
  const stockSymbol = useRecoilValue(atomCurrentSymbol);

  // State Local
  const [newsList, setNewsList] = React.useState(null);
  const [newsList2, setNewsList2] = React.useState(null);
  const [showChangePerc, setShowChangePerc] = React.useState(true);
  const [globalQuote, setGlobalQuote] = React.useState(null);
  const [currentSeries, setCurrentSeries] = React.useState("line");

  const changeSeries = (seriesType) => {
    let areaColor = _COLOR_AREA;
    let candleColor = {
      up: _COLOR_UP,
      down: _COLOR_DOWN,
    };

    if (seriesType === "line") {
      candleColor = {
        up: "transparent",
        down: "transparent",
      };
    }

    if (seriesType === "candle") {
      areaColor = "transparent";
    }

    setCurrentSeries(seriesType);

    updateAreaSeries(areaColor);
    updateCandleSeries(candleColor);
  };

  const updateCandleSeries = (candleColor) => {
    const tmpCandleSeries = chartRef.current.seriesCandle();
    tmpCandleSeries.applyOptions({
      upColor: candleColor.up,
      downColor: candleColor.down,
      borderVisible: false,
      wickUpColor: candleColor.up,
      wickDownColor: candleColor.down,
    });
  };

  const updateAreaSeries = (areaColor) => {
    const tmpAreaSeries = chartRef.current.seriesArea();

    tmpAreaSeries.applyOptions({
      topColor: areaColor,
      bottomColor:
        areaColor === "transparent"
          ? "rgba(41, 98, 255, 0.28)"
          : "rgba(0, 0, 0, 0)",
      lineColor: areaColor,
      lineWidth: 2,
    });
  };

  /**
   * @name changeDuration
   * @type Function
   * @param {String} durationType
   */
  const changeDuration = async (durationType) => {
    // Toast
    toast.loading(`Loading ${durationType} ...`);
    let queryObject = {};

    // Remove prev series
    chartRef.current.free();

    switch (durationType) {
      case "daily":
      case "5d":
        queryObject = {
          interval: "60min",
          custom: `outputsize=compact`,
          series: "TIME_SERIES_INTRADAY",
          objName: "Time Series (60min)",
        };
        break;
      case "mtd":
        queryObject = {
          interval: "60min",
          custom: `&outputsize=full&month=${new Date().getFullYear()}-${new Date().getMonth()}`,
          series: "TIME_SERIES_INTRADAY",
          objName: "Time Series (60min)",
        };
        break;
      case "l3y":
        queryObject = {
          interval: null,
          custom: `&outputsize=full`,
          series: "TIME_SERIES_DAILY",
          objName: "Time Series (Daily)",
        };
        break;
      case "l5y":
        queryObject = {
          interval: null,
          custom: `&outputsize=full`,
          series: "TIME_SERIES_DAILY",
          objName: "Time Series (Daily)",
        };
        break;
      case "l20y":
        queryObject = {
          interval: null,
          series: "TIME_SERIES_WEEKLY",
          objName: "Weekly Time Series",
        };
        break;
      default:
        console.log("durationType: ", durationType);
    }

    // QUERY VARs
    const querySymbol = stockSymbol["1. symbol"];
    const querySeries = queryObject.series;
    const queryInterval = queryObject.interval
      ? "&interval=" + queryObject.interval
      : "";
    const queryCustom = queryObject.custom ? queryObject.custom : "";

    // QUERY
    const url = `https://www.alphavantage.co/query?${queryInterval}${queryCustom}&function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    const resp = await fetchData(url, {
      querySymbol: querySymbol,
      durationType: durationType,
    });

    if (!resp || !resp[queryObject.objName]) {
      // UI Toast
      toast.remove();
      toast.error(`Error loading ${durationType} ...`);
    }

    const respAPI = resp[queryObject.objName];

    const { chartData, volumeData, areaData } = formatAPIData(respAPI);

    let filterAreaData = null;
    let filterCandleData = [];
    let filterVolData = [];

    if (durationType === "l3y" || durationType === "l5y") {
      filterAreaData = areaData.filter((itm, idx) => {
        const dtItm = DateTime.fromISO(itm.time);
        const dtNow = DateTime.now();

        const diffInMonths = dtNow.diff(dtItm, "months").toObject();
        const monthsCount = durationType === "l3y" ? 36 : 60;

        if (diffInMonths.months < monthsCount) {
          filterCandleData = [...filterCandleData, { ...chartData[idx] }];
          filterVolData = [...filterVolData, { ...volumeData[idx] }];
          return true;
        } else {
          return false;
        }
      });
    }

    let tmpAreaData = filterAreaData ? filterAreaData : areaData;
    let tmpVolData = filterVolData.length ? filterVolData : volumeData;
    let tmpChartData = filterCandleData.length ? filterCandleData : chartData;

    tmpChartData = tmpChartData.map((itm) => {
      return {
        ...itm,
        time: Date.parse(itm.time) / 1000, // In seconds (https://tradingview.github.io/lightweight-charts/docs/api#utctimestamp)
      };
    });
    tmpAreaData = tmpAreaData.map((itm) => {
      return {
        ...itm,
        time: Date.parse(itm.time) / 1000,
      };
    });

    tmpVolData = tmpVolData.map((itm) => {
      return {
        ...itm,
        time: Date.parse(itm.time) / 1000,
      };
    });

    // Create or Reference Chart
    const chart = chartRef.current.api();

    const tmpCandlestickSeries = chartRef.current.seriesCandle();
    const tmpAreaSeries = chartRef.current.seriesArea();
    const tmpVolumeSeries = chartRef.current.seriesVolume();

    // Set Data
    tmpCandlestickSeries.setData([...tmpChartData]);
    tmpAreaSeries.setData([...tmpAreaData]);
    tmpVolumeSeries.setData([...tmpVolData]);

    // Adjust chart
    chart.resize(
      window.innerWidth * _WIDTH_RATIO,
      window.innerWidth < 800 ? 400 : _HEIGHT
    );
    chart.timeScale().fitContent();

    if (currentSeries === "line") {
      updateAreaSeries(_COLOR_AREA);
    } else {
      let candleColor = {
        up: _COLOR_UP,
        down: _COLOR_DOWN,
      };
      updateCandleSeries(candleColor);
    }

    // UI Toast
    toast.remove();
  };

  const getGlobalQuote = async (tmpSymbol) => {
    // Query
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${tmpSymbol}&apikey=${API_KEY}`;
    const resp = await fetchData(url, {
      symbol: tmpSymbol.toLocaleLowerCase(),
    });

    setGlobalQuote(resp["Global Quote"]);
  };

  const getNewsData = async (tmpSymbol) => {
    // Query
    const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tmpSymbol}&apikey=${API_KEY}`;
    const resp = await fetchData(url, {
      symbol: tmpSymbol.toLocaleLowerCase(),
    });

    if (resp && resp.feed && resp.feed.length) {
      const filterNews = [...resp.feed].slice(0, 5);
      setNewsList(filterNews);
      if (resp.feed.length > 5) {
        const filterNews2 = [...resp.feed].slice(5, 10);
        setNewsList2(filterNews2);
      }
    }
  };

  /**
   * EFFECTS
   */
  React.useEffect(() => {
    if (stockSymbol) {
      changeDuration("mtd");
      const tmpStock = stockSymbol["1. symbol"];
      getNewsData(tmpStock);
      getGlobalQuote(tmpStock);
    }
  }, [stockSymbol]);

  React.useLayoutEffect(() => {
    const handleResize = () => {
      const chart = chartRef.current.api();
      chart.applyOptions({
        width: window.innerWidth * _WIDTH_RATIO,
        height: window.innerWidth < 800 ? 400 : _HEIGHT,
      });
      chart.timeScale().fitContent();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      chartRef.current.free();
    };
  }, []);

  return (
    <div id="home">
      <div>
        <div>
          <div id="stock-name" className="flex space-between">
            <h2>
              [{stockSymbol && stockSymbol["1. symbol"]}] &nbsp;&nbsp;
              {stockSymbol && stockSymbol["2. name"]}
            </h2>

            <div id="global-quote-shell">
              {globalQuote && (
                <div id="global-quote" className="">
                  <div id="global-quote-price" className="flex">
                    <h2>${Number(globalQuote["05. price"]).toFixed(2)}</h2>
                    <div>
                      <div id="quote-indicator"></div>
                      {showChangePerc ? (
                        <span id="quote-change-perc">
                          <div
                            className={`triangle ${
                              parseFloat(globalQuote["10. change percent"]) < 0
                                ? "colorDown"
                                : "colorUp"
                            }`}
                          ></div>{" "}
                          {parseFloat(
                            globalQuote["10. change percent"]
                          ).toFixed(2)}
                          %
                        </span>
                      ) : (
                        <span id="quote-change-price">
                          {" "}
                          {Number(globalQuote["09. change"]).toFixed(2)}{" "}
                        </span>
                      )}
                    </div>
                  </div>
                  <div id="global-quote-info" className="flex space-between">
                    <div>
                      <span>Range</span>
                      <br /> {Number(globalQuote["04. low"]).toFixed(2)} -{" "}
                      {Number(globalQuote["03. high"]).toFixed(2)}
                    </div>
                    <div>
                      <span>Open</span>
                      <br /> {Number(globalQuote["02. open"]).toFixed(2)}
                    </div>
                    <div>
                      <span>Volume</span> <br />
                      {globalQuote["06. volume"]}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <!-- CHART CONTAINER --> */}
          <div id="chartContainer"></div>

          {/* <!-- CHART CONTROLS --> */}
          <div id="chart-controls" className="flex space-between">
            {/* <!-- SELECT DURATION --> */}
            <div id="select-duration-container" className="text-light">
              <label>
                <input
                  type="radio"
                  name="chart_duration"
                  onClick={() => changeDuration("5d")}
                />
                <span className="checkmark"></span>
                5D
              </label>
              <label>
                <input
                  type="radio"
                  name="chart_duration"
                  defaultChecked
                  onClick={() => changeDuration("mtd")}
                />
                <span className="checkmark"></span>
                MTD
              </label>
              <label>
                <input
                  type="radio"
                  name="chart_duration"
                  onClick={() => changeDuration("l3y")}
                />
                <span className="checkmark"></span>
                3Y
              </label>
              <label>
                <input
                  type="radio"
                  name="chart_duration"
                  onClick={() => changeDuration("l5y")}
                />
                <span className="checkmark"></span>
                5Y
              </label>
              <label>
                <input
                  type="radio"
                  name="chart_duration"
                  onClick={() => changeDuration("l20y")}
                />
                <span className="checkmark"></span>
                20Y
              </label>
            </div>

            {/* <!-- SELECT SERIES --> */}
            <div id="select-series-container" className="text-light">
              <label>
                <input
                  type="radio"
                  name="chart_type"
                  onClick={() => changeSeries("candle")}
                />
                <span className="checkmark"></span>
                Candlestick Chart
              </label>
              <label>
                <input
                  type="radio"
                  name="chart_type"
                  onClick={() => changeSeries("line")}
                  defaultChecked
                />
                <span className="checkmark"></span>
                Line Chart
              </label>
            </div>
          </div>
        </div>

        <div id="stock-news-container">
          <h2>News</h2>
          <div className="flex">
            {newsList ? (
              <div id="stock-news-list">
                <div>
                  <ul>
                    {newsList.map((itm, idx) => {
                      return (
                        <li key={`top-gainer-itm-${idx}`} className="flex">
                          <div className="stock-news-date">
                            {DateTime.fromISO(itm.time_published).toFormat(
                              "M-dd-yyyy"
                            )}
                          </div>

                          <div>
                            <div className="stock-news-source">
                              {String(itm.source_domain).replace("www.", "")}
                            </div>

                            <div className="stock-news-title">
                              {" "}
                              {String(itm.title).split(" - ")[0]}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : null}

            {newsList2 ? (
              <div id="stock-news-list">
                <div>
                  <ul>
                    {newsList2.map((itm, idx) => {
                      return (
                        <li key={`top-gainer-itm-${idx}`} className="flex">
                          <div className="stock-news-date">
                            {DateTime.fromISO(itm.time_published).toFormat(
                              "M-dd-yyyy"
                            )}
                          </div>

                          <div>
                            <div className="stock-news-source">
                              {String(itm.source_domain).replace("www.", "")}
                            </div>

                            <div className="stock-news-title">
                              {" "}
                              {String(itm.title).split(" - ")[0]}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Home as default };
