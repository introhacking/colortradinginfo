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
        const value = params.value;
        // Handle string '-' or empty
        if (value === '-' || value === '' || value == null) {
            return { backgroundColor: 'black', fontStyle: 'italic', ...customCellStyle }; // style for missing data
        }
        const numValue = Number(value);
        if (numValue === -2) return { backgroundColor: 'red', ...customCellStyle };
        if (numValue === -1) return { backgroundColor: 'lightgray', ...customCellStyle };
        if (numValue === 0) return { backgroundColor: '#9056a9', ...customCellStyle };
        if (numValue === 1) return { backgroundColor: 'lightblue', ...customCellStyle };
        if (numValue === 2) return { backgroundColor: 'gray', ...customCellStyle };
        if (numValue === 3) return { backgroundColor: 'orange', ...customCellStyle };
        if (numValue === 4) return { backgroundColor: 'lightgreen', ...customCellStyle };
        if (numValue >= 5) return { backgroundColor: 'green', ...customCellStyle };

        return null; // no style
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

            if (type === 'large-cap' || type === 'mid-cap' || type === 'small-cap') {
                setRowData(serverResponse.data?.stocks);

                const today = new Date();
                const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jun'
                const currentYear = String(today.getFullYear()).slice(2);              // e.g., '25'
                const currentHeader = `${currentMonth}${currentYear}`;

                const dynamicColumns = Object.keys(serverResponse.data?.stocks[0])
                    .sort((a, b) => {
                        // Always keep 'stockName' first
                        if (a === 'stockName') return -1;
                        if (b === 'stockName') return 1;

                        // Put current month first
                        if (a === currentHeader) return -1;
                        if (b === currentHeader) return 1;

                        // Parse month and year to compare
                        const parse = (val) => {
                            const monthAbbr = val.slice(0, 3);
                            const year = parseInt(val.slice(3), 10);
                            const month = new Date(`${monthAbbr} 1, 2000`).getMonth(); // Get month index
                            return year * 12 + month;
                        };

                        return parse(b) - parse(a); // Descending order
                    })
                    .map(key => ({
                        headerName: key,
                        field: key,
                        sortable: true,
                        filter: true,
                        resizable: true,
                        cellRenderer: (params) => {
                            return (params.value === null || params.value === undefined) ? '-' : params.value;
                        },
                        cellStyle: params => getCellStyle(params),
                    }));
                setColumnDefs([...dynamicColumns]);

                console.log(dynamicColumns)

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

                const today = new Date();
                const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jun'
                const currentYear = String(today.getFullYear()).slice(2);              // e.g., '25'
                const currentHeader = `${currentMonth}${currentYear}`;

                const dateColumns = Array.from(allDates)
                    .map(date => ({
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

            } else if (type === 'combine-cap') {


                const today = new Date();
                const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jun'
                const currentYear = String(today.getFullYear()).slice(2);               // e.g., '25'
                const currentKey = `${currentMonth}${currentYear}`;                     // e.g., 'Jun25'

                // Helper to convert "Apr25" to numeric for sorting
                const getMonthValue = (key) => {
                    if (!/^[A-Za-z]{3}\d{2}$/.test(key)) return -Infinity; // non-date keys like 'stockName' go first
                    const monthAbbr = key.slice(0, 3);
                    const year = parseInt(key.slice(3), 10);
                    const month = new Date(`${monthAbbr} 1, 2000`).getMonth(); // 0-11
                    return year * 12 + month;
                };



                const normalizeSymbol = (str) =>
                    str?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();  // removes space, dot, dash, etc.

                // STEP 1: Process pivoted data
                const raw = serverResponse.data?.dateAverages || {};
                const allDates = new Set();
                const pivotMap = {};

                Object.entries(raw).forEach(([symbol, dateEntries]) => {
                    const normalizedSymbol = normalizeSymbol(symbol);
                    const row = { normalizedSymbol }; // you can also store original if needed

                    for (const [date, stats] of Object.entries(dateEntries)) {
                        allDates.add(date);
                        row[`deliv_${date}`] = `${stats.DELIV_QTY_avg} / ${stats.DELIV_QTY_percent}`;
                        row[`ttd_${date}`] = `${stats.TTL_TRD_QNTY_avg} / ${stats.TTL_TRD_QNTY_percent}`;
                    }

                    pivotMap[normalizedSymbol] = row;
                });


                // STEP 2: Filter only those stocks that exist in pivoted
                const stocks = serverResponse.data?.stocks || [];

                const mergedRows = stocks
                    .map(stock => {
                        const normalizedSymbol = normalizeSymbol(stock.stockName || stock.symbol);
                        if (pivotMap[normalizedSymbol]) {
                            return {
                                ...stock,
                                ...pivotMap[normalizedSymbol]
                            };
                        }
                        return null;
                    })
                    .filter(Boolean); // keep only matched rows
                // Remove nulls (i.e., non-common symbols)

                // STEP 3: Dynamic columns from stock
                const dynamicColumns = Object.keys(stocks[0] || {})
                    .sort((a, b) => {
                        if (a.toLowerCase() === 'stockname') return -1;
                        if (b.toLowerCase() === 'stockname') return 1;

                        if (a === currentKey) return -1;
                        if (b === currentKey) return 1;

                        return getMonthValue(b) - getMonthValue(a); // Descending order
                    })
                    .map(key => ({
                        headerName: key.toUpperCase(),
                        field: key,
                        sortable: true,
                        filter: true,
                        resizable: true,
                        // pinned: 'left',
                        cellRenderer: (params) => {
                            return (params.value === null || params.value === undefined) ? '-' : params.value;
                        },
                        cellStyle: params => getCellStyle(params),
                    }));

                const formatDateToHeader = (dateStr) => {
                    const [day, month, year] = dateStr.split('/');
                    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    return `${day}-${monthNames[parseInt(month, 10) - 1]}-${year}`;
                };

                const dateColumns = Array.from(allDates).sort((a, b) => {
                    const [dayA, monthA, yearA] = a.split('/').map(Number);
                    const [dayB, monthB, yearB] = b.split('/').map(Number);
                    const dateObjA = new Date(yearA, monthA - 1, dayA);
                    const dateObjB = new Date(yearB, monthB - 1, dayB);
                    return dateObjB - dateObjA;
                })
                    .map(date => ({
                        headerName: `Date: ${formatDateToHeader(date)}`,
                        marryChildren: true,
                        headerClass: 'cs_ag-center-header',
                        children: [
                            {
                                field: `deliv_${date}`,
                                headerName: 'Deliv Avg / Deliv %',
                                tooltipField: `deliv_${date}`,
                                filter: true,
                                cellStyle: params => getCellStyles(params),
                            },
                            {
                                field: `ttd_${date}`,
                                headerName: 'TTD Avg / TTD %',
                                tooltipField: `ttd_${date}`,
                                filter: true,
                                cellStyle: params => getCellStyles(params),
                            }
                        ]
                    }));


                // STEP 5: Set data
                setRowData(mergedRows);
                setColumnDefs([
                    ...dynamicColumns,
                    ...dateColumns
                ]);





                // const raw = serverResponse.data?.dateAverages || {};

                // const allDates = new Set();
                // const pivoted = Object.entries(raw).map(([symbol, dateEntries]) => {
                //     const row = { symbol };
                //     for (const [date, stats] of Object.entries(dateEntries)) {
                //         allDates.add(date);

                //         row[`deliv_${date}`] = `${stats.DELIV_QTY_avg} / ${stats.DELIV_QTY_percent}`;
                //         row[`ttd_${date}`] = `${stats.TTL_TRD_QNTY_avg} / ${stats.TTL_TRD_QNTY_percent}`;
                //     }
                //     return row;
                // });

                // const formatDateToHeader = (dateStr) => {
                //     const [day, month, year] = dateStr.split('/');
                //     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                //         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                //     const monthIndex = parseInt(month, 10) - 1;
                //     return `${day}-${monthNames[monthIndex]}-${year}`;
                // };

                // const dateColumns = Array.from(allDates).map(date => ({
                //     headerName: `Date: ${formatDateToHeader(date)}`, // e.g., "Date: 10/Jun/25"
                //     marryChildren: true,
                //     headerClass: 'cs_ag-center-header',
                //     children: [
                //         {
                //             field: `deliv_${date}`,
                //             headerName: 'Deliv Avg / Deliv %',
                //             tooltipField: `deliv_${date}`,
                //             filter: true,
                //             cellStyle: params => getCellStyles(params)
                //         },
                //         {
                //             field: `ttd_${date}`,
                //             headerName: 'TTD Avg / TTD %',
                //             tooltipField: `ttd_${date}`,
                //             filter: true,
                //             cellStyle: params => getCellStyles(params)
                //         }
                //     ]
                // }));

                // const columns = [
                //     { field: 'symbol', headerName: 'Symbol', filter: true },
                //     ...dateColumns
                // ];

                // // setRowData(serverResponse.data?.stocks);
                // const dynamicColumns = Object.keys(serverResponse.data?.stocks[0]).map(key => ({
                //     headerName: key,
                //     field: key,
                //     sortable: true,
                //     filter: true,
                //     resizable: true,
                //     cellStyle: params => getCellStyle(params),
                // }));

                // // setRowData([...serverResponse.data?.stocks , ...pivoted]);
                // // setColumnDefs([...dynamicColumns , ...columns]);
                // setRowData([...pivoted]);
                // setColumnDefs([...columns]);
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
    // const handleCombineTypeChange = (type) => {
    //     if (type === 'combine-cap' || type === 'large-cap' || type === 'small-cap' || type === 'mid-cap') {
    //         setDecision(true)
    //     }
    //     setToDate('')
    //     setCategory(type);
    //     fetchData(type, undefined);
    // };

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