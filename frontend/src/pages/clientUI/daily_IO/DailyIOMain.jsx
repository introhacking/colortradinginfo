import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Loading from '../../../Loading'
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import { toast } from 'sonner';

const DailyIOMain = () => {

    const [rowData, setRowData] = useState([]);
    const [avgerageData, setAverageData] = useState([]);
    const [avgColumnDefs, setAvgColumnDefs] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [dateHandler, setDateHandler] = useState({
        from_date: '',
        to_date: ''

    })
    const [activeTab, setActiveTab] = useState('fetch');
    const [activeTabStatus, setActiveTabStatus] = useState(false);


    // ERROR HANDLING
    const [errorMsg, setErrorMsg] = useState('')
    const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');


    const dateChangeHandler = async (e) => {
        const { name, value } = e.target
        const updatedDateHandler = { ...dateHandler, [name]: value };
        setDateHandler(updatedDateHandler);

        if (updatedDateHandler.from_date && updatedDateHandler.to_date) {
            getRequestDataBasedUponDate(updatedDateHandler)
        }

    }

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);

    const getRequestDataBasedUponDate = async (updatedDateHandler) => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/request-date', updatedDateHandler);
            const data = serverResponse.mergedData;

            // console.log(serverResponse.overallAverage)
            // console.log(data)

            if (data.length > 0) {
                // Transform nested object into array
                const transformedData = Object.entries(serverResponse.overallAverage).map(([symbol, stats]) => ({
                    symbol,
                    ...stats
                }));
                setAverageData(transformedData)

                setActiveTabStatus(true)

                // Step 1: Define desired order
                const preferredOrder = [
                    "SYMBOL",
                    "DELIV_QTY",
                    "DELIV_PER",
                    "TTL_TRD_QNTY",
                    "AVG_PRICE",
                    "CLOSE_PRICE",
                    "LAST_PRICE",
                    "DATE1",
                    "SERIES",
                    "PREV_CLOSE",
                    "OPEN_PRICE",
                    "HIGH_PRICE",
                    "LOW_PRICE",
                    "TURNOVER_LACS",
                    "NO_OF_TRADES"
                ];

                // Step 2: Reorder data
                const reorderedData = data.map((item) => {
                    const reorderedItem = {};
                    preferredOrder.forEach((key) => {
                        if (item.hasOwnProperty(key)) {
                            reorderedItem[key] = item[key];
                        }
                    });

                    // Add remaining keys not in preferredOrder
                    Object.keys(item).forEach((key) => {
                        if (!reorderedItem.hasOwnProperty(key)) {
                            reorderedItem[key] = item[key];
                        }
                    });

                    return reorderedItem;
                });

                // Step 3: Find duplicate SYMBOLs
                const symbolCount = {};
                reorderedData.forEach(item => {
                    const symbol = item["SYMBOL"]?.trim();
                    if (symbol) {
                        symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
                    }
                });

                // Step 4: Find symbols that appear more than once
                const duplicateSymbols = Object.entries(symbolCount)
                    .filter(([symbol, count]) => count > 1)
                    .map(([symbol]) => symbol);

                const isGroupingNeeded = duplicateSymbols.length > 0;

                // Step 5: Create dynamic columnDefs
                const keys = Object.keys(reorderedData[0]);
                const dynamicCols = keys.map((key) => ({
                    headerName: key.replace(/_/g, ' ').toUpperCase(),
                    field: key,
                    rowGroup: true,
                    sortable: true,
                    filter: true,
                    maxWidth: 145,
                    // rowGroup: key === " SYMBOL" && isGroupingNeeded,   // Group by SYMBOL if needed
                    // hide: key === " SYMBOL" && isGroupingNeeded        // Hide grouped SYMBOL column
                }));

                setColumnDefs([...dynamicCols]);
                setRowData(reorderedData);



                // [ FOR AVERAGE CALCULATION ]
                const avgColumnDefs = [
                    { field: 'symbol', headerName: 'SYMBOLS', filter: true },
                    { field: 'DELIV_QTY_avg', headerName: 'DELIVERY QUANTITY AVG' },
                    { field: 'DELIV_QTY_percentage', headerName: 'DELIVERY QUANTITY %' },
                    { field: 'DELIV_PER_avg', headerName: 'DELIVERY PER AVG' },
                    { field: 'DELIV_PER_percentage', headerName: 'DELIV PER %' },
                    { field: 'TTL_TRD_QNTY_avg', headerName: 'TTL TRD QNTY AVG' },
                    { field: 'TTL_TRD_QNTY_percentage', headerName: 'TTL TRD QNTY %' },
                    // { field: 'DELIV_PER_total', headerName: 'Delivery % Total' },
                    // { field: 'DELIV_QTY_total', headerName: 'Delivery Qty Total' },
                    // { field: 'TTL_TRD_QNTY_total', headerName: 'Total Traded Qty Total' },
                    // { field: 'count', headerName: 'Count' },
                ];



                setAvgColumnDefs(avgColumnDefs)

            } else {
                setNoDataFoundMsg('No data found for the selected date.');
            }
            console.log(serverResponse)
            if (Array.isArray(serverResponse.alerts)) {
                serverResponse.alerts?.forEach((alert) => {
                    toast.success(alert.message);
                })
            };
            // } else if (typeof serverResponse.messages === 'string') {
            //     console.log(serverResponse.messages);
            //     toast.success(serverResponse.messages);
            // }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const autoGroupColumnDef = {
        headerName: 'Symbol Group',
        field: 'SYMBOL',
        cellRendererParams: {
            suppressCount: false,
        },
    };


    const groupDisplayType = 'groupRows';

    const groupRowRendererParams = {
        suppressCount: true,
    };

    // Handle Tab Switch
    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    if (isLoading) { return <div className='flex justify-center items-center h-screen'><Loading msg={'Loading... please wait'} /></div> }
    // if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    return (

        <div className='p-4 bg-gray-50'>
            <div className='flex justify-start gap-3 items-center mb-4'>
                <div className='w-1/5 relative select-none bg-white'>
                    <input onChange={dateChangeHandler} value={dateHandler.from_date} type="date" id='from_date' name='from_date' placeholder='From Date' className='for_input peer' />
                    <label htmlFor="from_date" className='for_label'>From Date</label>
                </div>
                <div className='w-1/5 relative select-none bg-white'>
                    <input onChange={dateChangeHandler} value={dateHandler.to_date} type="date" id='to_date' name='to_date' placeholder='To Date' className='for_input peer' />
                    <label htmlFor="to_date" className='for_label'>To Date</label>
                </div>
            </div>
            {activeTabStatus &&
                <div className="flex mb-3">
                    <Button
                        className={`px-3 py-1 text-sm font-semibold ${activeTab === 'fetch' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                            } rounded-l`}
                        onClick={() => switchTab('fetch')}
                        children={'Fetch Data'}
                    />
                    <Button
                        className={`px-3 py-1 text-sm font-semibold ${activeTab === 'average' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                            } rounded-r`}
                        onClick={() => switchTab('average')}
                        children={'Average'}
                    />
                </div>
            }
            {/* <input type="date" className='ml-4 w-1/6' onChange={(e) => { dateChange(e) }} /> */}

            {/* {isLoading && <div className='flex justify-center items-center min-h-screen'> <Loading msg='Loading... please wait' /></div>} */}
            {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
            {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
            {!dateHandler.from_date && !dateHandler.to_date && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: Please Select Date first</span></div>}

            {!isLoading && !error && !noDataFoundMsg && dateHandler.from_date && dateHandler.to_date && (
                <div className='ag-theme-alpine overflow-y-auto h-[75vh] w-full'>

                    {activeTab === 'fetch' &&
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            pagination={true}
                            rowSelection="multiple"
                            paginationPageSize={100}
                            rowGroupPanelShow={"always"}
                            groupDefaultExpanded={1}
                            autoGroupColumnDef={autoGroupColumnDef}
                            groupRowRendererParams={groupRowRendererParams}
                            groupDisplayType={groupDisplayType}
                        />
                    }

                    {activeTab === 'average' &&
                        <AgGridReact
                            rowData={avgerageData}
                            columnDefs={avgColumnDefs}
                            defaultColDef={defaultColDef}
                            animateRows={true}
                            pagination={true}
                            paginationPageSize={100}
                        />
                    }

                </div>
            )}
        </div>


    )
}

export default DailyIOMain