import React from "react";

const News = () => {
  const [newsList, setNewsList] = React.useState(null);

  const getData = async () => {
    const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=demo`;
    const getData = await fetch(url);
    const resp = await getData.json();

    console.log("news: ", resp);
    setNewsList(resp);
  };

  React.useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <h2>News</h2>
      {newsList ? (
        <div id="news-list" className="flex">
          <div>
            <h3>Top Gainers</h3>
            <ul>
              {newsList.top_gainers.map((itm, idx) => {
                return <li key={`top-gainer-itm-${idx}`}>{itm.ticker}</li>;
              })}
            </ul>
          </div>
          <div>
            <h3>Top Losers</h3>
            <ul>
              {newsList.top_losers.map((itm, idx) => {
                return <li key={`top-loser-itm-${idx}`}>{itm.ticker}</li>;
              })}
            </ul>
          </div>
          <div>
            <h3>Most Actively Traded</h3>
            <ul>
              {newsList.most_actively_traded.map((itm, idx) => {
                return <li key={`top-loser-itm-${idx}`}>{itm.ticker}</li>;
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { News as default };
