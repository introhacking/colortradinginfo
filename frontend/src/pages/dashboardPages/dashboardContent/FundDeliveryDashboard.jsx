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

    const getCellStyles = (params) => {
        const value = parseFloat(params.value?.replace('%', '') || '0');
        if (value > 800) return { backgroundColor: 'green', ...customCellStyle }; // green
        if (value > 250) return { backgroundColor: 'lightgreen', ...customCellStyle }; // yellow
        return null;
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

                // [ 2 METHOD ]
                const raw = serverResponse.data?.dateAverages || {};

                const allDates = new Set();
                const pivoted = Object.entries(raw).map(([symbol, dateEntries]) => {
                    const row = { symbol };
                    for (const [date, stats] of Object.entries(dateEntries)) {
                        allDates.add(date);

                        row[`deliv_${date}`] = `${stats.DELIV_QTY_avg} / ${stats.DELIV_QTY_percent}`;
                        row[`ttd_${date}`] = `${stats.TTL_TRD_QNTY_avg} / ${stats.TTL_TRD_QNTY_percent}`;
                    }
                    return row;
                });

                const formatDateToHeader = (dateStr) => {
                    const [day, month, year] = dateStr.split('/');
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    const monthIndex = parseInt(month, 10) - 1;
                    return `${day}-${monthNames[monthIndex]}-${year}`;
                };

                const dateColumns = Array.from(allDates).map(date => ({
                    headerName: `Date: ${formatDateToHeader(date)}`, // e.g., "Date: 10/Jun/25"
                    marryChildren: true,
                    headerClass: 'cs_ag-center-header',
                    children: [
                        {
                            field: `deliv_${date}`,
                            headerName: 'Deliv Avg / Deliv %',
                            tooltipField: `deliv_${date}`,
                            filter: true,
                            cellStyle: params => getCellStyles(params)
                        },
                        {
                            field: `ttd_${date}`,
                            headerName: 'TTD Avg / TTD %',
                            tooltipField: `ttd_${date}`,
                            filter: true,
                            cellStyle: params => getCellStyles(params)
                        }
                    ]
                }));

                const columns = [
                    { field: 'symbol', headerName: 'Symbol', pinned: 'left', filter: true },
                    ...dateColumns
                ];

                setColumnDefs(columns);
                setRowData(pivoted);




                // [ 1 METHOD ]

                // const transformedData = Object.entries(serverResponse.data?.dateAverages || {}).flatMap(([symbol, dates]) =>
                //     Object.entries(dates).map(([date, stats]) => ({
                //         symbol,
                //         date,
                //         ...stats,
                //     }))
                // );

                // // ✅ Set row data immediately
                // setRowData(transformedData);

                // const staticColumns = [
                //     { field: 'symbol', headerName: 'Symbol', filter: true },
                //     { field: 'date', headerName: 'Date', filter: true },
                //     { field: 'DELIV_QTY_avg', headerName: 'Delivery Qty Avg', type: 'numericColumn' },
                //     {
                //         field: 'DELIV_QTY_percent',
                //         headerName: 'Delivery Qty %',
                //         filter: true,
                //         cellStyle: params => getCellStyles(params), // optional color
                //     },
                //     { field: 'TTL_TRD_QNTY_avg', headerName: 'Total Traded Qty Avg', type: 'numericColumn' },
                //     {
                //         field: 'TTL_TRD_QNTY_percent',
                //         headerName: 'Total Traded Qty %',
                //         filter: true,
                //     },
                // ];
                // setColumnDefs(staticColumns);

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
    const [showDailySpurt, setShowDailySpurt] = useState(false)


    return (
        <>
            <div className="flex justify-between mb-3">
                <div className='flex gap-2'>
                    <button onClick={() => setShowDailySpurt((showDailySpurt) => !showDailySpurt)} className='button button_daily'>{showDailySpurt ? 'Hide' : 'Show'} Daily Spurt</button>
                    {showDailySpurt &&
                        <Button className={''} children={
                            <input max={getYesterdayDate()} value={toDate} onChange={(e) => handleDateChange(e.target.value)} type='date' className='button' placeholder='Choose Date' />
                        } />
                    }
                </div>
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
            {!isLoading && !error && !noDataFoundMsg && rowData.length > 0 ? (
                <div className="ag-theme-alpine h-[71vh] w-full">
                    <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination={true} />


                </div>

            ) : <div className='bg-gray-100 px-4 py-1 rounded inline-block my-4'><span className='font-medium text-gray-400'>Message: No data found for the selected option</span></div>
            }

            {/* {decision ?
    (
        <>
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

} */}

        </>
    )
}

export default FundDeliveryDashboard