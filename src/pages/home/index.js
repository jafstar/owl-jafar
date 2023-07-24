import React from "react";
import { createChart } from "lightweight-charts";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";

import { formatAPIData } from "../../utils/format";
import { atomCurrentSymbol } from "../../components/Layout/Header";
import { TEST_DATA } from "../../../mockdata/TIME_SERIES_DAILY_AAPL";
import "./styles.css";

const API_KEY = process.env.ALPHAVANTAGE_API;
// const _WIDTH = window.innerWidth * 0.7;
const _HEIGHT = 600;

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

        // this._api.timeScale().fitContent();
      }
      return this._api;
    },
    free(series) {
      if (this._api) {
        this._api.removeSeries(series);
        this._api.remove();
        this._api = undefined;
      }
    },
    removeSeries(series) {
      if (this._api) {
        this._api.removeSeries(series);
      }
    },
  });

  // State Store
  const stockSymbol = useRecoilValue(atomCurrentSymbol);

  // State Local
  const [stateSeries, setStateSeries] = React.useState(null);
  const [volumeSeries, setVolumeSeries] = React.useState(null);
  const [candlestickSeries, setCandlestickSeries] = React.useState(null);
  const [areaSeries, setAreaSeries] = React.useState(null);
  /**
   * callAPI
   * @param {String} querySymbol
   */
  const callAPI = async (querySymbol) => {
    // Toast
    toast.loading("Getting stock info...");

    // Remove prev series
    chartRef.current.free(stateSeries);

    /*
    const querySeries = "TIME_SERIES_DAILY";
    const url = `https://www.alphavantage.co/query?function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    const getData = await fetch(url);
    const resp = await getData.json();
    */
    // MOCK DATA
    const resp = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(TEST_DATA);
      }, 2000);
    });

    const respAPI = resp["Time Series (Daily)"];

    const { chartData, volumeData, areaData } = formatAPIData(respAPI);

    // Create or Reference Chart
    const chart = chartRef.current.api();

    // Series - Candlestick
    const tmpCandlestickSeries = chart.addCandlestickSeries({
      upColor: "transparent",
      downColor: "transparent",
      borderVisible: false,
      wickUpColor: "transparent",
      wickDownColor: "transparent",
    });

    // Series - Area
    const tmpAreaSeries = chart.addAreaSeries({
      topColor: "transparent",
      bottomColor: "rgba(41, 98, 255, 0)",
      lineColor: "transparent",
      lineWidth: 2,
    });
    tmpAreaSeries.priceScale().applyOptions({
      scaleMargins: {
        // positioning the price scale for the area series
        top: 0.1,
        bottom: 0.4,
      },
    });

    // Series - Volume
    const volumeSeries = chart.addHistogramSeries({
      color: "#26a69a",
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
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.7, // highest point of the series will be 70% away from the top
        bottom: 0,
      },
    });

    // Set Data
    tmpCandlestickSeries.setData([...chartData]);
    tmpAreaSeries.setData([...areaData]);
    volumeSeries.setData([...volumeData]);

    // Adjust chart
    chart.resize(window.innerWidth * 0.7, _HEIGHT);
    chart.timeScale().fitContent();

    // Set State
    setStateSeries(tmpCandlestickSeries);
    setVolumeSeries(volumeSeries);
    setCandlestickSeries(tmpCandlestickSeries);
    setAreaSeries(tmpAreaSeries);
    // UI Toast
    toast.remove();
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

          <div id="chartContainer"></div>
          <div>
            <label>
              <input
                type="radio"
                name="chart_type"
                onClick={() => {
                  setStateSeries(candlestickSeries);
                  console.log("candlestickSeries: ", candlestickSeries);
                  candlestickSeries.applyOptions({
                    upColor: "#26a69a",
                    downColor: "#ef5350",
                    borderVisible: false,
                    wickUpColor: "#26a69a",
                    wickDownColor: "#ef5350",
                  });
                  areaSeries.applyOptions({
                    topColor: "transparent",
                    bottomColor: "rgba(41, 98, 255, 0)",
                    lineColor: "transparent",
                  });
                }}
              />
              Candlestick Chart
            </label>
            <label>
              <input
                type="radio"
                name="chart_type"
                onClick={() => {
                  setStateSeries(areaSeries);
                  console.log("areaSeries: ", areaSeries);
                  areaSeries.applyOptions({
                    topColor: "#2962FF",
                    bottomColor: "rgba(41, 98, 255, 0.28)",
                    lineColor: "#2962FF",
                    lineWidth: 2,
                  });

                  candlestickSeries.applyOptions({
                    upColor: "transparent",
                    downColor: "transparent",
                    borderVisible: false,
                    wickUpColor: "transparent",
                    wickDownColor: "transparent",
                  });
                }}
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
