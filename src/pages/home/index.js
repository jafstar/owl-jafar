import React from "react";
import { createChart } from "lightweight-charts";
import { Link } from "react-router-dom";
import { useRecoilValue } from "recoil";
import toast from "react-hot-toast";
import { DateTime } from "luxon";

import {
  API_KEY,
  _HEIGHT,
  _COLOR_UP,
  _COLOR_DOWN,
  _COLOR_VOLUME,
} from "../../constants";
import { formatAPIData } from "../../utils/format";
import { atomCurrentSymbol } from "../../components/Layout/Header";
// import {
//   DAILY_AAPL,
//   DAILY_GOOG,
//   DAILY_IBM,
// } from "../../../mockdata/TIME_SERIES_DAILY";
import {
  DURATION_5D_AAPL,
  DURATION_MTD_AAPL,
  DURATION_L3Y_AAPL,
  DURATION_L5Y_AAPL,
  DURATION_L20Y_AAPL,
} from "../../../mockdata/DURATION";

import "./styles.css";

function timeToLocal(originalTime) {
  const parsedTime = Date.parse(originalTime) / 1000;
  const d = new Date(parsedTime * 1000);
  return (
    Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds()
    ) / 1000
  );
}

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
  localization: {
    dateFormat: "yyyy-MM-dd HH:mm",
    // timeFormatter: (businessDayOrTimestamp) => {
    //   console.log("businessDayOrTimestamp: ", businessDayOrTimestamp);
    //   return Date(businessDayOrTimestamp); //or whatever JS formatting you want here
    // },
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
    // Toast
    toast.loading(`Loading ${durationType} ...`);
    let queryObject = {};

    // Remove prev series
    chartRef.current.free();

    switch (durationType) {
      case "daily":
        console.log("is daily: ", durationType === "daily");
      case "5d":
        console.log("is 5d: ", durationType === "5d");
        queryObject = {
          interval: "60min",
          custom: `outputsize=compact`,
          series: "TIME_SERIES_INTRADAY",
          objName: "Time Series (60min)",
        };
        break;
      case "mtd":
        console.log("is mtd: ", durationType === "mtd");
        queryObject = {
          interval: "60min",
          custom: `&outputsize=full&month=${new Date().getFullYear()}-${new Date().getMonth()}`,
          series: "TIME_SERIES_INTRADAY",
          objName: "Time Series (60min)",
        };
        break;
      case "l3y":
        console.log("is l3y: ", durationType === "l3y");
        queryObject = {
          interval: null,
          custom: `&outputsize=full`,
          series: "TIME_SERIES_DAILY",
          objName: "Time Series (Daily)",
        };
        break;
      case "l5y":
        console.log("is l5y: ", durationType === "l5y");
        queryObject = {
          interval: null,
          custom: `&outputsize=full`,
          series: "TIME_SERIES_DAILY",
          objName: "Time Series (Daily)",
        };
        break;
      case "l20y":
        console.log("is l20y: ", durationType === "l20y");
        queryObject = {
          interval: null,
          series: "TIME_SERIES_WEEKLY",
          objName: "Weekly Time Series",
        };
        break;
      default:
        console.log("durationType: ", durationType);
    }

    // const querySymbol = stockSymbol["1. symbol"];
    // const querySeries = queryObject.series;
    // const queryInterval = queryObject.interval
    //   ? "&interval=" + queryObject.interval
    //   : "";
    // const queryCustom = queryObject.custom ? queryObject.custom : "";
    // const url = `https://www.alphavantage.co/query?${queryInterval}${queryCustom}&function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`;
    // const getData = await fetch(url);
    // const resp = await getData.json();

    // MOCK DATA
    const resp = await new Promise((resolve) => {
      setTimeout(() => {
        switch (durationType) {
          case "5d":
            resolve(DURATION_5D_AAPL);
            break;
          case "mtd":
            resolve(DURATION_MTD_AAPL);
            break;
          case "l3y":
            resolve(DURATION_L3Y_AAPL);
            break;
          case "l5y":
            resolve(DURATION_L5Y_AAPL);
            break;
          case "l20y":
            resolve(DURATION_L20Y_AAPL);
            break;
          default:
            reject(null);
        }
      }, 2000);
    });

    console.log("duration query: ", resp);

    if (!resp || !resp[queryObject.objName]) {
      // UI Toast
      toast.remove();
      // Toast
      toast.error(`Error loading ${durationType} ...`);
    }

    const respAPI = resp[queryObject.objName];

    console.log("respAPI: ", respAPI);

    const { chartData, volumeData, areaData } = formatAPIData(respAPI);

    console.log("chartData: ", chartData);

    let filterAreaData = null;
    let filterCandleData = [];
    let filterVolData = [];

    if (durationType === "l3y" || durationType === "l5y") {
      filterAreaData = areaData.filter((itm, idx) => {
        const dtItm = DateTime.fromISO(itm.time);
        const dtNow = DateTime.now();

        const diffInMonths = dtNow.diff(dtItm, "months").toObject();

        // console.log("dtNow: ", dtNow);
        // console.log("diffInMonths: ", diffInMonths);
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
    console.log("filterAreaData: ", filterAreaData);
    console.log("filterCandleData: ", filterCandleData);

    let tmpAreaData = filterAreaData ? filterAreaData : areaData;
    let tmpVolData = filterVolData.length ? filterVolData : volumeData;
    let tmpChartData = filterCandleData.length ? filterCandleData : chartData;

    // if (durationType === "5d") {
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
    //   }
    console.log("tmpAreaData: ", tmpAreaData);
    console.log("tmpVolData: ", tmpVolData);
    console.log("tmpChartData: ", tmpChartData);

    // Create or Reference Chart
    const chart = chartRef.current.api();

    console.log("chart: ", chart);

    const tmpCandlestickSeries = chartRef.current.seriesCandle();
    const tmpAreaSeries = chartRef.current.seriesArea();
    const tmpVolumeSeries = chartRef.current.seriesVolume();

    // Set Data
    tmpCandlestickSeries.setData([...tmpChartData]);
    tmpAreaSeries.setData([...tmpAreaData]);
    tmpVolumeSeries.setData([...tmpVolData]);

    // Adjust chart
    chart.resize(window.innerWidth * 0.7, _HEIGHT);
    chart.timeScale().fitContent();

    updateAreaSeries(_COLOR_UP);

    // UI Toast
    toast.remove();
  };

  /**
   * EFFECTS
   */

  React.useEffect(() => {
    if (stockSymbol) {
      console.log("stock: ", stockSymbol);
      // callAPI(stockSymbol["1. symbol"]);
      changeDuration("mtd");
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
            {/* <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("daily")}
                defaultChecked
              />
              Daily
            </label> */}
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
                defaultChecked
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
            <label>
              <input
                type="radio"
                name="chart_duration"
                onClick={() => changeDuration("l20y")}
              />
              Last 20 Years
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
