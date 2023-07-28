import { createChart } from "lightweight-charts";
import {
  _WIDTH_RATIO,
  _HEIGHT,
  _COLOR_UP,
  _COLOR_DOWN,
  _COLOR_VOLUME,
  _COLOR_AREA,
} from "../constants";

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

export const CHART_REF_OBJECT = {
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
};
