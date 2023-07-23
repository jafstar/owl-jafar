import React from "react";
import { createChart } from "lightweight-charts";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";

import { atomCurrentSymbol } from "../../components/Layout/Header";
import { TEST_DATA } from "../../../mockdata/TIME_SERIES_DAILY_AAPL";
import "./styles.css";

const API_KEY = process.env.ALPHAVANTAGE_API;
// const _WIDTH = window.innerWidth * 0.7;
const _HEIGHT = 600;

const chartOptions = {
  layout: {
    textColor: "white",
    background: {
      type: "solid",
      color: "black",
    },
  },
  rightPriceScale: {
    borderVisible: false,
  },
};

const Home = () => {
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
        this._api.removeSeries(stateSeries);
        this._api.remove();
        this._api = undefined;
      }
    },
  });

  // State Store
  const stockSymbol = useRecoilValue(atomCurrentSymbol);

  // State Local
  const [stateSeries, setStateSeries] = React.useState(null);

  const callAPI = async (querySymbol) => {
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

    console.log("mock resp: ", resp);
    const respAPI = resp["Time Series (Daily)"];

    const apiSeries = Object.entries(respAPI).map((itm) => {
      return {
        time: String(itm[0]),
        open: Number(itm[1]["1. open"]),
        high: Number(itm[1]["2. high"]),
        low: Number(itm[1]["3. low"]),
        close: Number(itm[1]["4. close"]),
      };
    });
    const apiArea = Object.entries(respAPI).map((itm) => {
      return {
        time: String(itm[0]),
        value: Number(itm[1]["4. close"]),
      };
    });
    const apiVolume = Object.entries(respAPI).map((itm) => {
      return {
        time: String(itm[0]),
        volume: Number(itm[1]["5. volume"]),
        color: "#26a69a",
      };
    });

    const chart = chartRef.current.api();

    // const candlestickSeries = chart.addCandlestickSeries({
    //   upColor: "#26a69a",
    //   downColor: "#ef5350",
    //   borderVisible: false,
    //   wickUpColor: "#26a69a",
    //   wickDownColor: "#ef5350",
    // });

    const areaSeries = chart.addAreaSeries({
      topColor: "#2962FF",
      bottomColor: "rgba(41, 98, 255, 0.28)",
      lineColor: "#2962FF",
      lineWidth: 2,
    });
    areaSeries.priceScale().applyOptions({
      scaleMargins: {
        // positioning the price scale for the area series
        top: 0.1,
        bottom: 0.4,
      },
    });

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
    // Init vars
    let chartData;
    let volumeData;
    let areaData;

    // Check Time
    const d1 = DateTime.fromISO(apiSeries[0].time);
    const d2 = DateTime.fromISO(apiSeries[apiSeries.length - 1].time);

    if (d2 > d1) {
      chartData = apiSeries;
      volumeData = apiVolume;
      areaData = apiArea;
    } else {
      chartData = apiSeries.reverse();
      volumeData = apiVolume.reverse();
      areaData = apiArea.reverse();
    }

    // DEBUG
    // console.log("resp: ", resp);
    // console.log(respAPI);
    // console.log("chart: ", chart);
    // console.log("apiSeries: ", apiSeries);
    // console.log("d2 < d1 :", d2 < d1);
    // console.log("d2 > d1 :", d2 > d1);
    // console.log("chartData: ", chartData);
    // console.log(candlestickSeries);
    console.log("chartData: ", chartData);
    console.log("areaData: ", areaData);

    console.log("volumeData: ", volumeData);
    // Set Data
    // candlestickSeries.setData([...chartData]);
    areaSeries.setData([
      { time: "2018-10-19", value: 54.9 },
      { time: "2018-10-22", value: 54.98 },
      { time: "2018-10-23", value: 57.21 },
      { time: "2018-10-24", value: 57.42 },
      { time: "2018-10-25", value: 56.43 },
      { time: "2018-10-26", value: 55.51 },
      { time: "2018-10-29", value: 56.48 },
      { time: "2018-10-30", value: 58.18 },
      { time: "2018-10-31", value: 57.09 },
      { time: "2018-11-01", value: 56.05 },
    ]);
    volumeSeries.setData([
      { time: "2018-10-19", value: 19103293.0, color: "#26a69a" },
      { time: "2018-10-22", value: 21737523.0, color: "#26a69a" },
      { time: "2018-10-23", value: 29328713.0, color: "#26a69a" },
      { time: "2018-10-24", value: 37435638.0, color: "#26a69a" },
      { time: "2018-10-25", value: 25269995.0, color: "#26a69a" },
      { time: "2018-10-26", value: 24973311.0, color: "#26a69a" },
      { time: "2018-10-29", value: 22103692.0, color: "#26a69a" },
      { time: "2018-10-30", value: 25231199.0, color: "#26a69a" },
      { time: "2018-10-31", value: 24214427.0, color: "#26a69a" },
      { time: "2018-11-01", value: 22533201.0, color: "#26a69a" },
    ]);

    // Adjust chart
    chart.resize(window.innerWidth * 0.7, _HEIGHT);
    chart.timeScale().fitContent();

    // Set State
    // setStateSeries(candlestickSeries);

    // UI Toast
    toast.remove();
  };

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

/*
1. symbol
: 
"GOOG"
2. name
: 
"Alphabet Inc - Class C"
3. type
: 
"Equity"
4. region
: 
"United States"
5. marketOpen
: 
"09:30"
6. marketClose
: 
"16:00"
7. timezone
: 
"UTC-04"
8. currency
: 
"USD"
9. matchScore
: 
"1.0000"
*/
