import React, { useEffect, useState } from 'react'

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Loading from '../../../Loading';
import Button from '../../../components/componentLists/Button';


import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js/auto';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const FundDeliveryDashboard = () => {
    const [category, setCategory] = useState('daily-spurts');
    const [toDate, setToDate] = useState('');

    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    // Loading 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');


    const [chartData, setChartData] = useState(null);
    const [decision, setDecision] = useState(false);


    const customCellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 0',
        // width: '80px',
        height: "20px",
        marginTop: '7px',
        marginRight: 'auto',
        marginLeft: '10px',
        color: 'white',
        textAlign: 'center'
    }

    const getCellStyle = params => {
        if (params.value == 1) { return { backgroundColor: 'red', ...customCellStyle } };
        if (params.value == 2) { return { backgroundColor: 'lightgray', ...customCellStyle } };
        if (params.value == 3) { return { backgroundColor: 'orange', ...customCellStyle } };
        if (params.value == 4) { return { backgroundColor: 'lightgreen', ...customCellStyle } };
        if (params.value >= 5) { return { backgroundColor: 'green', ...customCellStyle } };
    };

    const fetchData = async (type, to_date) => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');

        try {

            const queryParams = {};
            if (type) queryParams.type = type;
            if (to_date) queryParams.to_date = to_date;

            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/fetch-data', queryParams);
            console.log(serverResponse);

            if (type === 'large-cap' || type === 'mid-cap' || type === 'small-cap' || type === 'combine-cap') {
                setRowData(serverResponse.data?.stocks);
                const dynamicColumns = Object.keys(serverResponse.data?.stocks[0]).map(key => ({
                    headerName: key,
                    field: key,
                    sortable: true,
                    filter: true,
                    resizable: true,
                    cellStyle: params => getCellStyle(params),
                }));
                setColumnDefs([...dynamicColumns]);

                // Extract chart labels
                const dates = serverResponse.data?.monthsHeader || [];
                // Build datasets
                const datasets = serverResponse.data?.stocks.map(stock => {
                    const data = dates.map(date => {
                        // Convert month label ('Mar-25') to property key ('Mar25')
                        const key = date.replace('-', '');
                        return stock[key] ?? 0; // Default to 0 if null/undefined
                    });

                    return {
                        label: stock.stockName,
                        data,
                        backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
                    };
                });

                setChartData({ labels: dates, datasets });


            } else if (type === 'daily-spurts') {
                const transformedData = Object.entries(serverResponse.data?.dateAverages).flatMap(([date, symbols]) =>
                    Object.entries(symbols).map(([symbol, stats]) => ({
                        date,
                        symbol,
                        ...stats,
                    }))
                );

                const groupedBySymbol = transformedData.reduce((acc, curr) => {
                    const { symbol, date, DELIV_QTY_percentage } = curr;
                    if (!acc[symbol]) acc[symbol] = {};
                    acc[symbol][date] = DELIV_QTY_percentage;
                    return acc;
                }, {});

                const dates = [...new Set(transformedData.map(item => item.date))].sort();

                setRowData(transformedData);
                // setSymbols(transformedData);

                // const datasets = Object.entries(groupedBySymbol).map(([symbol, dataByDate]) => ({
                //     label: symbol,
                //     data: dates.map(date => parseFloat(dataByDate[date] || 0)),
                //     backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
                //     fill: false,
                // }));

                // const datasets = symbols.map(symbol => (
                //     {
                //         label: symbol,
                //         data: dates.map(date => parseFloat(data[date][symbol]?.DELIV_QTY_percentage || 0)),
                //         borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
                //         fill: false,
                //     }
                // ));

                // console.log(datasets)

                // setChartData({ labels: dates, datasets });



                setColumnDefs([
                    { field: 'symbol', headerName: 'SYMBOLS', filter: true, flex: 1 },
                    { field: 'date', headerName: 'Date', filter: true, flex: 1 },
                    { field: 'DELIV_QTY_avg', headerName: 'DELIVERY QUANTITY AVG', flex: 1 },
                    { field: 'DELIV_QTY_percentage', headerName: 'DELIVERY QUANTITY %', filter: true, flex: 1, cellStyle: params => getCellStyle(params) },
                    { field: 'TTL_TRD_QNTY_avg', headerName: 'TTL TRD QNTY AVG', flex: 1 },
                    { field: 'TTL_TRD_QNTY_percentage', headerName: 'TTL TRD QNTY %', filter: true, flex: 1 }
                ])
            } else {
                setNoDataFoundMsg('No data found for the selected option.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeChange = (type) => {
        if (type === 'combine-cap' || type === 'large-cap' || type === 'small-cap' || type === 'mid-cap') {
            setDecision(true)
        }
        setToDate('')
        setCategory(type);
        fetchData(type, undefined);
    };

    const handleDateChange = (date) => {
        setDecision(false)
        setToDate(date);
        setCategory('daily-spurts');
        fetchData('daily-spurts', date); // always 'daily-spurts' with date
    };

    // useEffect(() => {
    //     fetchData('daily-spurts', '');
    // }, []);

    const getYesterdayDate = () => {
        const today = new Date();
        today.setDate(today.getDate() - 1); // Go back one day
        return today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    };


    const [showMutualFunds, setShowMutualFunds] = useState(false)


    return (
        <>
            <div className="flex justify-between mb-3">
                <Button className={''} children={
                    <input max={getYesterdayDate()} value={toDate} onChange={(e) => handleDateChange(e.target.value)} type='date' className='button' placeholder='Choose Date' />
                } />
                <div className='flex gap-2'>
                    <button onClick={() => setShowMutualFunds((showMutualFunds) => !showMutualFunds)} className='button button_video'>{showMutualFunds ? 'Hide' : 'Show'} Mutual Funds</button>
                    {showMutualFunds && ['large-cap', 'mid-cap', 'small-cap'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
                            className={`button font-medium rounded ${category === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            {type.replace('-', ' ').toUpperCase()}
                        </button>
                    ))}

                </div>
                <Button onClick={() => handleTypeChange('combine-cap')} className={'button bg-blue-500 text-white'} children={'Combine All Caps'} />
            </div>
            {isLoading && <Loading msg='Loading... please wait' />}
            {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
            {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
            {!isLoading && !error && !noDataFoundMsg && (
                <div className="ag-theme-alpine h-[71vh] w-full">
                    {/* <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination={true} /> */}

                    {decision ?

                        (
                            <>

                                {/* <Line key={Date.now()}
                                data={chartData}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { position: 'top' }, title: { display: true, text: 'Delivery % Change Over Dates' } }
                                }} /> */}
                                <div className='p-2 border rounded bg-gradient-to-r from-amber-50 to-slate-100'>
                                    <Bar
                                        key={Date.now()} // ensures chart is remounted on data change
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            plugins: {
                                                legend: { position: 'top' },
                                                title: { display: true, text: category.replace('-', ' ').toUpperCase() },
                                            },
                                        }}
                                    />
                                </div>

                            </>
                        ) : <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination={true} />

                    }

                </div>

            )}

        </>
    )
}

export default FundDeliveryDashboard