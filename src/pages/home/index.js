import React from "react";
import { createChart } from "lightweight-charts";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import {
  atom,
  selector,
  DefaultValue,
  useRecoilState,
  useResetRecoilState,
  useRecoilValue,
} from "recoil";

import { atomCurrentSymbol } from "../../components/Layout/Header";
import "./styles.css";

const API_KEY = process.env.ALPHAVANTAGE_API;
const chartOptions = {
  layout: {
    textColor: "white",
    background: {
      type: "solid",
      color: "black",
    },
  },
};

const Home = () => {
  const inputSymbolRef = React.useRef();
  const chartRef = React.useRef({
    api() {
      if (!this._api) {
        console.log("new chart created...");
        this._api = createChart(
          document.getElementById("chartRef"),
          chartOptions
        );

        // this._api.timeScale().fitContent();
      }
      return this._api;
    },
    free() {
      if (this._api) {
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
    // chart.removeSeries(stateSeries);
    // chartRef.current.free();

    const querySeries = "TIME_SERIES_DAILY";
    const url = `https://www.alphavantage.co/query?function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    const getData = await fetch(url);
    const resp = await getData.json();
    const respAPI = resp["Time Series (Daily)"];

    // setStockSymbol(querySymbol);

    const apiSeries = Object.entries(respAPI).map((itm) => {
      return {
        time: String(itm[0]),
        open: Number(itm[1]["1. open"]),
        high: Number(itm[1]["2. high"]),
        low: Number(itm[1]["3. low"]),
        close: Number(itm[1]["4. close"]),
      };
    });

    const chart = chartRef.current.api();
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    let chartData;
    const d1 = DateTime.fromISO(apiSeries[0].time);
    const d2 = DateTime.fromISO(apiSeries[apiSeries.length - 1].time);

    if (d2 > d1) {
      chartData = apiSeries;
    } else {
      chartData = apiSeries.reverse();
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

    candlestickSeries.setData([...chartData]);
    chart.resize(700, 300);
    chart.timeScale().fitContent();

    setStateSeries(candlestickSeries);
  };

  React.useEffect(() => {
    if (stockSymbol) {
      callAPI(stockSymbol);
    }
  }, [stockSymbol]);

  React.useLayoutEffect(() => {
    // callAPI(stockSymbol);

    return () => {
      chartRef.current.free();
    };
  }, []);

  return (
    <div id="home">
      <h2>{stockSymbol}</h2>
      <div id="chartRef"></div>
    </div>
  );
};

export { Home as default };
