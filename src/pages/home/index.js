import React from 'react'
import { createChart } from 'lightweight-charts';
import {DateTime} from 'luxon'
import {
    Link
} from "react-router-dom"
import "./styles.css"

const API_KEY = process.env.ALPHAVANTAGE_API;
const chartOptions = { layout: { 
    textColor: 'white', 
    background: { 
            type: 'solid', 
            color: 'black' 
        } 
    } 
};


const Home = () => {    

    const inputSymbolRef = React.useRef()
    const chartRef = React.useRef({
        api(){
            if(!this._api) {
                console.log('new chart created...')
                this._api = createChart(
                    document.getElementById('chartRef'), 
                    chartOptions
                );

               // this._api.timeScale().fitContent();
            }
            return this._api
        },
        free(){
            if(this._api){
                this._api.remove()
                this._api = undefined
            }
        }
    })


    const [stockSymbol, setStockSymbol] = React.useState('IBM')
     const [stateSeries, setStateSeries] = React.useState(null)

    const searchSymbol= async () => {

        const currentSearchSymbol = inputSymbolRef.current.value
        const chart = chartRef.current.api()

        console.log("searching new symbol: ", currentSearchSymbol)
        const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${currentSearchSymbol}&apikey=${API_KEY}`
        const getData = await fetch(url)
        const resp = await getData.json()
        console.log('resp: ', resp)

        const selectedSymbol = resp.bestMatches[0]['1. symbol']
        console.log(selectedSymbol)

        chart.removeSeries(stateSeries)
        chartRef.current.free()
        callAPI(selectedSymbol )
    }

    const callAPI = async (querySymbol)=> {
           
            
       
        const querySeries = "TIME_SERIES_DAILY"
        const url = `https://www.alphavantage.co/query?function=${querySeries}&symbol=${querySymbol}&apikey=${API_KEY}`
        
        
        const getData = await fetch(url)
        const resp = await getData.json()
         console.log('resp: ', resp)
        
        const respAPI = resp['Time Series (Daily)']
        
        setStockSymbol(querySymbol)
        
         console.log(respAPI)
        const apiSeries = Object.entries(respAPI).map(itm => {
            //  console.log('itm: ', itm)
            return {
                time: String(itm[0]), 
                open: Number(itm[1]['1. open']), 
                high: Number(itm[1]['2. high']), 
                low: Number(itm[1]['3. low']), 
                close: Number(itm[1]['4. close'])
            }
        })

   
		const chart = chartRef.current.api();
        console.log("chart: ", chart)

         console.log("apiSeries: ", apiSeries)
        //  callBack(apiSeries.reverse())

         const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', 
            downColor: '#ef5350', 
            borderVisible: false,
            wickUpColor: '#26a69a', 
            wickDownColor: '#ef5350',
        });

        // const tmpSeries = apiSeries
        
        let chartData

        // const DateTime = luxon.DateTime;
        var d1 = DateTime.fromISO(apiSeries[0].time);
        
        var d2 = DateTime.fromISO(apiSeries[apiSeries.length - 1].time);
        console.log("d2 < d1 :",d2 < d1); 
        console.log("d2 > d1 :", d2 > d1); 
        // if(d2 < d1){
        //     chartData = tmpSeries.reverse()
        // }
        if(d2 > d1){
            chartData = apiSeries
        } else {
            chartData = apiSeries.reverse()
        }


        console.log("chartData: ", chartData)
        console.log(candlestickSeries)
        candlestickSeries.setData([
            ...chartData,
          ]);

          chart.resize(700, 300)
          chart.timeScale().fitContent();
         
          setStateSeries(candlestickSeries)
    }





    React.useLayoutEffect(()=>{
    
        const defaultSymbol = "GOOG"
        callAPI(defaultSymbol)

        return ()=>{
            chartRef.current.free()
        }
    }, [])

    return (
        <div id="home">

            
            <div>
                <input 
                    ref={inputSymbolRef}
                    type="search" 
                    name="input-symbol" 
                    className="field input-text" 
                    placeholder="symbol"
                />
                <button onClick={()=>searchSymbol()}>Search</button>
            </div>


            <h2>{stockSymbol}</h2>

            <div id="chartRef">

            </div>


            {/* <div id="homepage-grid">
                <div className="box-outline">
                    <Link to="/reports">Chart</Link>
                </div>
                <div className="box-outline">
                    <Link to="/gauges">News</Link>
                </div>
            </div> */}
        </div>
    )
}

export { Home as default }

