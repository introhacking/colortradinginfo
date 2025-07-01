import React, { useEffect, useMemo, useState } from 'react';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import LiveNSEModal from '../../../components/dashboardPageModal/liveNSEStockModal/LiveNSEModal';
import LiveData from '../liveData/LiveData';
import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';
import LiveExcelSheet from '../liveExcelSheet/LiveExcelSheet';


function StockPriceChecker() {
    const [symbol, setSymbol] = useState('BEL');
    const [stockData, setStockData] = useState(null);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showLiveNSEData, setShowLiveNSEData] = useState(true)
    const [connectExcel, setConnectExcel] = useState(false)

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


    return (
        <>
            <div className='flex justify-between mb-2'>
                <div className='flex gap-2 items-center'>
                    <Button onClick={() => { setShowLiveNSEData((prev) => !prev); setConnectExcel(false) }} children={`${showLiveNSEData ? 'Show Live Stock Data' : 'Show NSE Checker'}`} className={'button button_video'} />
                    <Button onClick={() => setConnectExcel(true)} children={`Connect to Excel`} className={`${connectExcel ? 'button_ac' : 'bg-green-200 text-green-700'} button`} />
                </div>
                <Button onClick={() => setIsModalOpen(true)} children={'Add Live StockName'} className={`${(showLiveNSEData || !connectExcel) && 'hidden'} button button_ac`} />
            </div>

            {!connectExcel ? (
                <>
                    {showLiveNSEData ? (
                        <>
                            <div className="shadow-xl bg-white rounded-lg p-3 w-full mb-2">
                                <h1 className="text-xl font-semibold mb-4">NSE Stock Price Checker</h1>
                                <div className='flex gap-3'>
                                    <input type="text"
                                        value={symbol}
                                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                                        placeholder="Enter NSE Symbol (e.g., RELIANCE)"
                                        className="border border-gray-300 rounded w-4/5" />
                                    <Button disabled={!symbol} onClick={fetchPrice} children={'Get Details'} className={`${!symbol ? 'cursor-not-allowed button button_ac opacity-45' : 'button button_ac'}`} />

                                </div>
                            </div>
                            <div className='h-[53vh] overflow-y-auto'>
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
                                                    {/* <div className='flex justify-between items-center p-2 border-b'>
                            <p className='text-[12px] uppercase'>Volume</p>
                            <p className='text-[16px] font-semibold'>
                                {stockData.averageDailyVolume10Day > 0
                                    ? ((stockData.regularMarketVolume / stockData.averageDailyVolume10Day) * 100).toFixed(2) + '%'
                                    : 'N/A'}
                            </p>
                        </div> */}
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
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                        </>

                    )
                        :
                        (
                            <>
                                <LiveData />
                            </>
                        )
                    }
                </>
            ) : (
                <>

                    {
                        connectExcel && <LiveExcelSheet />
                    }
                </>

            )}

            <LiveNSEModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

export default StockPriceChecker;
