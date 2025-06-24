import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';

function StockPriceChecker() {
    const [symbol, setSymbol] = useState('BEL');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState('');

    const fetchPrice = async () => {
        if (!symbol.trim()) return;
        setError('');
        setStockData(null);
        try {
            const res = await bankingService.fetchCSVDataFromDateRequest(`/google-finanace`, { symbol })
            console.log(res)
            setStockData(res);
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong!');
        }
    };

    // useEffect(() => {
    //     let interval;
    //     if (symbol) {
    //         fetchPrice(); // initial fetch
    //         interval = setInterval(() => {
    //             fetchPrice();
    //         }, 10000); // 10 seconds
    //     }

    //     return () => clearInterval(interval);
    // }, [symbol]);

    return (
        <>
            <div className="shadow-xl bg-white rounded-lg p-3 w-full mb-2">
                <h1 className="text-xl font-semibold mb-4">NSE Stock Price Checker</h1>
                <div className='flex gap-3'>
                    <input type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="Enter NSE Symbol (e.g., RELIANCE)"
                        className="border border-gray-300 rounded w-4/5" />
                    <Button disabled={!symbol} onClick={fetchPrice} children={'Get Price'} className={`${!symbol ? 'cursor-not-allowed button button_ac opacity-45' : 'button button_ac'}`} />

                </div>
            </div>
            {stockData && (
                <div className='flex justify-between p-2'>
                    <div className='w-[70%] p-2'>
                        <div className='flex items-center gap-2'>
                            <h2 className="text-xl font-semibold">{stockData.shortName} ({stockData.symbol})</h2>
                            <div className='flex gap-2 items-center'>
                                <p className='rounded p-1.5 font-semibold bg-red-200 text-red-500'>&#11206; {stockData.fiftyTwoWeekRange?.low}</p>
                                <p className='rounded p-1.5 font-semibold bg-green-200 text-green-500'>{stockData.fiftyTwoWeekRange?.high} &#11205;</p>
                            </div>
                        </div>
                        <p className="text-2xl font-semibold">₹{stockData.regularMarketPrice}</p>


                        graph
                    </div>
                    <div className='w-[25%]'>
                        <div className='rounded-md bg-white'>
                            <>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Previous close</p>
                                    <p className='text-[16px] font-semibold'>₹{stockData.regularMarketPreviousClose}</p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Date-range</p>
                                    <p className='text-[16px] font-semibold'>₹{stockData.regularMarketDayRange?.low} - ₹{stockData.regularMarketDayRange?.high}</p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Year range</p>
                                    <p className='text-[16px] font-semibold'>₹{stockData.fiftyTwoWeekRange?.low} - ₹{stockData.fiftyTwoWeekRange?.high} </p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Market cap</p>
                                    <p className='text-[16px] font-semibold'>{(stockData.marketCap / 10000000).toFixed(2)} Cr</p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Avg Volume</p>
                                    <p className='text-[16px] font-semibold'>{stockData.averageDailyVolume3Month}</p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>P/E ratio</p>
                                    <p className='text-[16px] font-semibold'>{stockData.trailingPE}</p>
                                </div>
                                <div className='flex justify-between items-center p-2 border-b'>
                                    <p className='text-[12px] uppercase'>Primary exchange</p>
                                    <p className='text-[16px] font-semibold'>₹{stockData.fullExchangeName}</p>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            )}


            {error && <p className="text-red-500">{error}</p>}
            {/* {stockData && (
                <div className="bg-gray-100 p-4 rounded mt-4">
                    <h2 className="text-xl font-semibold">{stockData.symbol}</h2>
                    <p>Price: ₹{stockData.regularMarketPrice}</p>
                    <p>Exchange: {stockData.exchange}</p>
                    <p>Currency: {stockData.currency}</p>
                    <p>
                        Time:{' '}
                        {new Date(stockData.regularMarketTime).toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                        })}
                    </p>
                </div>
            )} */}
        </>
    );
}

export default StockPriceChecker;
