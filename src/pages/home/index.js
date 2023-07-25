import React from "react";
import { createChart } from "lightweight-charts";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";

import {
  API_KEY,
  _HEIGHT,
  _COLOR_UP,
  _COLOR_DOWN,
  _COLOR_VOLUME,
} from "../../constants";
import { formatAPIData } from "../../utils/format";
import { atomCurrentSymbol } from "../../components/Layout/Header";
import {
  DAILY_AAPL,
  DAILY_GOOG,
  DAILY_IBM,
} from "../../../mockdata/TIME_SERIES_DAILY";
import { DURATION_TEST_DATA } from "../../../mockdata/DURATION_5D_AAPL";

import "./styles.css";

const chartOptions = {
  layout: {
    textColor: "#ccc",
    background: {
      type: "solid",
      color: "#111",
    },
  },
  rightPriceScale: {
    borderVisible: false,
  },
};

const Home = () => {
  // Refs
  const chartRef = React.useRef({
    api() {
      if (!this._api) {
        console.log("new chart created...");
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
            // positioning the price scale for the area series
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
          priceScaleId: "", // set as an overlay by setting a blank priceScaleId
          // set the positioning of the volume series
          scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
            bottom: 0,
          },
        });
        this._seriesVolume.priceScale().applyOptions({
          scaleMargins: {
            top: 0.7, // highest point of the series will be 70% away from the top
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
  // const [stateSeries, setStateSeries] = React.useState(null);
  // const [volumeSeries, setVolumeSeries] = React.useState(null);
  // const [candlestickSeries, setCandlestickSeries] = React.useState(null);
  // const [areaSeries, setAreaSeries] = React.useState(null);
  /**
   * callAPI
   * @param {String} querySymbol
   */
  const callAPI = async (querySymbol) => {
    // Toast
    toast.loading(`Loading ${querySymbol} ...`);

    // Remove prev series
    chartRef.current.free();

    // const querySeries = "TIME_SERIES_DAILY";
    // const url = `https://www.alphavantage.co/query?function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    // const getData = await fetch(url);
    // const resp = await getData.json();

    // MOCK DATA
    const resp = await new Promise((resolve, reject) => {
      setTimeout(() => {
        switch (querySymbol.toLocaleLowerCase()) {
          case "aapl":
            resolve(DAILY_AAPL);
            break;
          case "goog":
            resolve(DAILY_GOOG);
            break;
          case "ibm":
            resolve(DAILY_IBM);
            break;
          default:
            reject(null);
        }
      }, 2000);
    });

    const respAPI = resp["Time Series (Daily)"];

    const { chartData, volumeData, areaData } = formatAPIData(respAPI);

    // Create or Reference Chart
    const chart = chartRef.current.api();

    console.log("chart: ", chart);

    const tmpCandlestickSeries = chartRef.current.seriesCandle();
    const tmpAreaSeries = chartRef.current.seriesArea();
    const tmpVolumeSeries = chartRef.current.seriesVolume();

    // Set Data
    tmpCandlestickSeries.setData([...chartData]);
    tmpAreaSeries.setData([...areaData]);
    tmpVolumeSeries.setData([...volumeData]);

    // Adjust chart
    chart.resize(window.innerWidth * 0.7, _HEIGHT);
    chart.timeScale().fitContent();

    // Set State
    // setStateSeries(tmpCandlestickSeries);
    // setVolumeSeries(tmpVolumeSeries);
    // setCandlestickSeries(tmpCandlestickSeries);
    // setAreaSeries(tmpAreaSeries);

    updateAreaSeries(_COLOR_UP);

    // UI Toast
    toast.remove();
  };

  const changeSeries = (seriesType) => {
    // setStateSeries(areaSeries);
    // console.log("areaSeries: ", areaSeries);

    let areaColor = _COLOR_UP;
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
    let queryObject = {};

    switch (durationType) {
      case "daily":
        console.log("is daily: ", durationType === "daily");
      case "5d":
        console.log("is 5d: ", durationType === "5d");
        queryObject = {
          interval: "60min",
          series: "TIME_SERIES_INTRADAY",
          objName: "Time Series (60min)",
        };
        break;
      case "mtd":
        console.log("is mtd: ", durationType === "mtd");
        break;
      case "l3y":
        console.log("is l3y: ", durationType === "l3y");
        break;
      case "l5y":
        console.log("is l5y: ", durationType === "l5y");
        break;
      default:
        console.log("durationType: ", durationType);
    }

    // const querySymbol = stockSymbol["1. symbol"];
    // const querySeries = queryObject.series;
    // const url = `https://www.alphavantage.co/query?outputsize=compact&interval=${queryObject.interval}&function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    // const getData = await fetch(url);
    // const resp = await getData.json();
    // MOCK DATA
    const resp = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(DURATION_TEST_DATA);
      }, 2000);
    });

    console.log("duration query: ", resp);

    const respAPI = resp[queryObject.objName];

    const { chartData, volumeData, areaData } = formatAPIData(respAPI);

    console.log("chartData: ", chartData);
  };

  /**
   * EFFECTS
   */

  React.useEffect(() => {
    if (stockSymbol) {
      console.log("stock: ", stockSymbol);
      callAPI(stockSymbol["1. symbol"]);
    }
  }, [stockSymbol]);

  React.useLayoutEffect(() => {
    const handleResize = () => {
      const chart = chartRef.current.api();
      chart.applyOptions({
        width: window.innerWidth * 0.7,
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
      <div className="flex">
        <div>
          <div className="flex">
            <h2>{stockSymbol && stockSymbol["1. symbol"]}</h2>
            <h2>{stockSymbol && stockSymbol["2. name"]}</h2>
          </div>
          {/* <!-- CHART SELECT DURATION --> */}
          <div id="select-duration-container" className="text-light">
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("daily")}
                defaultChecked
              />
              Daily
            </label>
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("5d")}
              />
              Last 5 Days
            </label>
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("mtd")}
              />
              Month to Date
            </label>
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("l3y")}
              />
              Last 3 Years
            </label>
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("l5y")}
              />
              Last 5 Years
            </label>
          </div>

          {/* <!-- CHART CONTAINER --> */}
          <div id="chartContainer"></div>

          {/* <!-- CHART SERIES SELECT --> */}
          <div className="text-light">
            <label>
              <input
                type="radio"
                name="chart_type"
                onClick={() => changeSeries("candle")}
              />
              Candlestick Chart
            </label>
            <label>
              <input
                type="radio"
                name="chart_type"
                onClick={() => changeSeries("line")}
                defaultChecked
              />
              Line Chart
            </label>
          </div>
        </div>
        <div>
          <h1>{stockSymbol && stockSymbol["2. name"]}</h1>
          <h2>{stockSymbol && stockSymbol["1. symbol"]}</h2>
        </div>
      </div>
    </div>
  );
};

export { Home as default };
