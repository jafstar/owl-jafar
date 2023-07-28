import { NEWS_SENT_AAPL } from "../../mockdata/NEWS_SENT_AAPL";
import {
  DURATION_5D_AAPL,
  DURATION_MTD_AAPL,
  DURATION_MTD_IBM,
  DURATION_MTD_GOOG,
  DURATION_L3Y_AAPL,
  DURATION_L5Y_AAPL,
  DURATION_L20Y_AAPL,
} from "../../mockdata/DURATION";
import {
  GLOBAL_QUOTE_AAPL,
  GLOBAL_QUOTE_GOOG,
  GLOBAL_QUOTE_IBM,
} from "../../mockdata/GLOBAL_QUOTE";

import {
  SEARCH_QUERY_AAPL,
  SEARCH_QUERY_GOOG,
  SEARCH_QUERY_IBM,
} from "../../mockdata/SEARCH_QUERY";

/**
 * MOCK TIMEOUT
 */
const MOCK_TIMEOUT = 250;

/**
 * @name fetchData
 * @type UtilFunc
 * @param {String} url
 * @param {Object} opt User defined object to be passed to MOCK_FUNCTIONS
 * @returns
 */
export const fetchData = async (url, opt) => {
  // Mock function setup
  if (process.env.ENVRIONMENT_STAGE === "DEV") {
    if (url.includes("NEWS_SENTIMENT")) {
      return MOCK_NEWS_SENTIMENT(opt);
    }

    if (url.includes("GLOBAL_QUOTE")) {
      return MOCK_GLOBAL_QUOTE(opt);
    }

    if (url.includes("SYMBOL_SEARCH")) {
      return MOCK_SEARCH_QUERY(opt);
    }

    if (
      url.includes("TIME_SERIES_DAILY") ||
      url.includes("TIME_SERIES_INTRADAY") ||
      url.includes("TIME_SERIES_WEEKLY")
    ) {
      return MOCK_DURATION(opt);
    }
  }

  // Prod normal use
  if (process.env.ENVRIONMENT_STAGE === "PROD") {
    const getData = await fetch(url);
    return getData.json();
  }
};

const MOCK_NEWS_SENTIMENT = (opt) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (opt.symbol) {
        case "aapl":
          resolve(NEWS_SENT_AAPL);
          break;
        case "goog":
          resolve(NEWS_SENT_AAPL);
          break;
        case "ibm":
          resolve(NEWS_SENT_AAPL);
          break;
        default:
          reject(null);
          break;
      }
    }, MOCK_TIMEOUT);
  });
};

const MOCK_GLOBAL_QUOTE = (opt) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (opt.symbol) {
        case "aapl":
          resolve(GLOBAL_QUOTE_AAPL);
          break;
        case "goog":
          resolve(GLOBAL_QUOTE_GOOG);
          break;
        case "ibm":
          resolve(GLOBAL_QUOTE_IBM);
          break;
        default:
          reject(null);
      }
    }, MOCK_TIMEOUT);
  });
};

const MOCK_SEARCH_QUERY = (opt) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (opt.symbol) {
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
    }, MOCK_TIMEOUT);
  });
};

const MOCK_DURATION = (opt) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      switch (opt.durationType) {
        case "5d":
          resolve(DURATION_5D_AAPL);
          break;
        case "mtd":
          switch (opt.querySymbol.toLocaleLowerCase()) {
            case "aapl":
              resolve(DURATION_MTD_AAPL);
              break;
            case "goog":
              resolve(DURATION_MTD_GOOG);
              break;
            case "ibm":
              resolve(DURATION_MTD_IBM);
              break;
            default:
              reject(null);
              break;
          }

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
    }, MOCK_TIMEOUT);
  });
};
