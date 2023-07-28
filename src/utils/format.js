import { DateTime } from "luxon";

export const formatAPIData = (respAPI) => {
  const respArr = Object.entries(respAPI);

  const apiSeries = respArr.map((itm) => {
    return {
      time: String(itm[0]),
      open: Number(itm[1]["1. open"]),
      high: Number(itm[1]["2. high"]),
      low: Number(itm[1]["3. low"]),
      close: Number(itm[1]["4. close"]),
    };
  });
  const apiArea = respArr.map((itm) => {
    return {
      time: itm[0],
      value: Number(itm[1]["4. close"]),
    };
  });

  const apiVolume = respArr.map((itm) => {
    return {
      time: itm[0], //DateTime.fromISO(itm[0]).toFormat("yyyy-MM-dd"),
      value: Number(itm[1]["5. volume"]),
      color: "#45c8e5", // #26a69a
    };
  });

  // Check Time
  const d1 = DateTime.fromISO(apiSeries[0].time);
  const d2 = DateTime.fromISO(apiSeries[apiSeries.length - 1].time);

  // Init vars
  let chartData;
  let volumeData;
  let areaData;

  // If date is Desc, flip to Asc
  if (d2 > d1) {
    chartData = apiSeries;
    volumeData = apiVolume;
    areaData = apiArea;
  } else {
    chartData = apiSeries.reverse();
    volumeData = apiVolume.reverse();
    areaData = apiArea.reverse();
  }

  return {
    chartData,
    volumeData,
    areaData,
  };
};
