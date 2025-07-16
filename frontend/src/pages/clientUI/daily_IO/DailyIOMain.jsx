import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'ag-grid-enterprise';
import Loading from '../../../Loading'
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import { apiService } from '../../../services/apiService';
import Button from '../../../components/componentLists/Button';
import { toast } from 'sonner';
import Custom_AGFilter from './Custom_AGFilter';

const DailyIOMain = () => {

    const [rowData, setRowData] = useState([]);
    const [avgerageData, setAverageData] = useState([]);
    const [avgColumnDefs, setAvgColumnDefs] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [dateTabs, setDateTabs] = useState([]);
    const [allDateAverages, setAllDateAverages] = useState({});

    // const [dateHandler, setDateHandler] = useState({
    //     from_date: '',
    //     to_date: ''

    // })
    const [dateHandler, setDateHandler] = useState({
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

        if (updatedDateHandler.to_date) {
            getRequestDataBasedUponDate(updatedDateHandler)
        }

    }

    // const getRequestDataBasedUponDate_check = async (updatedDateHandler) => {
    //     setIsLoading(true);
    //     setError('');
    //     setNoDataFoundMsg('');
    //     try {
    //         const serverResponse = await apiService.fetchCSVDataFromDateRequest('/request-date', updatedDateHandler);
    //         const data = serverResponse.mergedData;

    //         console.log(serverResponse)

    //         if (data.length > 0) {
    //             // Transform nested object into array
    //             const transformedData = Object.entries(serverResponse.overallAverage).map(([symbol, stats]) => ({
    //                 symbol,
    //                 ...stats,
    //             }));

    //             // const transformedData = Object.entries(serverResponse.groupedByDate).map(([date, rows]) => ({                    
    //             //     date, ...rows,
    //             // }));

    //             // console.log(transformedData)

    //             setAverageData(transformedData)

    //             setActiveTabStatus(true)

    //             // Step 1: Define desired order
    //             const preferredOrder = [
    //                 "SYMBOL",
    //                 "DELIV_QTY",
    //                 "DELIV_PER",
    //                 "TTL_TRD_QNTY",
    //                 "AVG_PRICE",
    //                 "CLOSE_PRICE",
    //                 "LAST_PRICE",
    //                 "DATE1",
    //                 "SERIES",
    //                 "PREV_CLOSE",
    //                 "OPEN_PRICE",
    //                 "HIGH_PRICE",
    //                 "LOW_PRICE",
    //                 "TURNOVER_LACS",
    //                 "NO_OF_TRADES"
    //             ];

    //             // Step 2: Reorder data
    //             const reorderedData = data.map((item) => {
    //                 const reorderedItem = {};
    //                 preferredOrder.forEach((key) => {
    //                     if (item.hasOwnProperty(key)) {
    //                         reorderedItem[key] = item[key];
    //                     }
    //                 });

    //                 // Add remaining keys not in preferredOrder
    //                 Object.keys(item).forEach((key) => {
    //                     if (!reorderedItem.hasOwnProperty(key)) {
    //                         reorderedItem[key] = item[key];
    //                     }
    //                 });

    //                 return reorderedItem;
    //             });

    //             // Step 3: Find duplicate SYMBOLs
    //             const symbolCount = {};
    //             reorderedData.forEach(item => {
    //                 const symbol = item["SYMBOL"]?.trim();
    //                 if (symbol) {
    //                     symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
    //                 }
    //             });

    //             // Step 4: Find symbols that appear more than once
    //             const duplicateSymbols = Object.entries(symbolCount)
    //                 .filter(([symbol, count]) => count > 1)
    //                 .map(([symbol]) => symbol);

    //             const isGroupingNeeded = duplicateSymbols.length > 0;

    //             // Step 5: Create dynamic columnDefs
    //             const keys = Object.keys(reorderedData[0]);
    //             const dynamicCols = keys.map((key) => ({
    //                 headerName: key.replace(/_/g, ' ').toUpperCase(),
    //                 field: key,
    //                 rowGroup: true,
    //                 sortable: true,
    //                 filter: true,
    //                 maxWidth: 200,

    //                 // rowGroup: key === " SYMBOL" && isGroupingNeeded,   // Group by SYMBOL if needed
    //                 // hide: key === " SYMBOL" && isGroupingNeeded        // Hide grouped SYMBOL column
    //             }));

    //             setColumnDefs([...dynamicCols]);
    //             setRowData(reorderedData);



    //             // [ FOR AVERAGE CALCULATION ]
    //             const avgColumnDefs = [
    //                 { field: 'symbol', headerName: 'SYMBOLS', filter: true },
    //                 { field: 'DELIV_QTY_avg', headerName: 'DELIVERY QUANTITY AVG' },
    //                 {
    //                     field: 'DELIV_QTY_percentage', headerName: 'DELIVERY QUANTITY %', filter: Custom_AGFilter,
    //                 },
    //                 // { field: 'DELIV_PER_avg', headerName: 'DELIVERY PER AVG' },
    //                 // { field: 'DELIV_PER_percentage', headerName: 'DELIV PER %' },
    //                 { field: 'TTL_TRD_QNTY_avg', headerName: 'TTL TRD QNTY AVG' },
    //                 { field: 'TTL_TRD_QNTY_percentage', headerName: 'TTL TRD QNTY %', filter: Custom_AGFilter },
    //                 // { field: 'DELIV_PER_total', headerName: 'Delivery % Total' },
    //                 // { field: 'DELIV_QTY_total', headerName: 'Delivery Qty Total' },
    //                 // { field: 'TTL_TRD_QNTY_total', headerName: 'Total Traded Qty Total' },
    //                 // { field: 'count', headerName: 'Count' },
    //             ];

    //             setAvgColumnDefs(avgColumnDefs)

    //         } else {
    //             setNoDataFoundMsg('No data found for the selected date.');
    //         }
    //         // console.log(serverResponse)
    //         if (Array.isArray(serverResponse.alerts)) {
    //             serverResponse.alerts?.forEach((alert) => {
    //                 toast.success(alert.message);
    //             })
    //         };
    //         // } else if (typeof serverResponse.messages === 'string') {
    //         //     console.log(serverResponse.messages);
    //         //     toast.success(serverResponse.messages);
    //         // }
    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    const handleAverageDateChange = (date) => {
        const avgData = allDateAverages[date];
        if (!avgData) return;

        const transformed = Object.entries(avgData).map(([symbol, stats]) => ({
            symbol,
            ...stats,
        }));

        setAverageData(transformed);
        setDateHandler({ to_date: date }); // highlight selected tab
    };

    const customCellStyle = {
        // display: 'flex',
        // alignItems: 'center',
        // justifyContent: 'center',
        // padding: '13px 0',
        // width: '80px',
        // height: "20px",
        // marginTop: '7px',
        // marginRight: 'auto',
        // marginLeft: '10px',
        color: 'white',
        fontWeight: 700,
        textAlign: 'center'

    }

    const getCellStyle = params => {
        const rawValue = params.value;
        // Remove the % sign and convert to float
        const numericValue = parseFloat(String(rawValue).replace('%', ''));

        if (numericValue >= 250) {
            return { backgroundColor: 'green', ...customCellStyle };
        }

        // if (numericValue >= 300) {
        //     return { backgroundColor: 'orange', ...customCellStyle };
        // }

        // if (numericValue > 250 && numericValue < 300) {
        //     return { backgroundColor: 'green', ...customCellStyle };
        // }
    };

    const getRequestDataBasedUponDate = async (updatedDateHandler) => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');

        try {
            const serverResponse = await apiService.fetchCSVDataFromDateRequest('/request-date', updatedDateHandler);
            const data = serverResponse.mergedData || [];

            // setDateTabs(serverResponse.mainDateISO)

            // console.log("Server Response:", serverResponse);

            if (data.length === 0) {
                setNoDataFoundMsg('No data found for the selected date.');
                return;
            }

            // ===== Average Stats Handling =====

            if (serverResponse.dateAverages) {

                setAllDateAverages(serverResponse.dateAverages); // Save all averages

                const dateKeys = Object.keys(serverResponse.dateAverages);
                setDateTabs(dateKeys);

                const transformedData = Object.entries(serverResponse.dateAverages).flatMap(([date, symbols]) =>
                    Object.entries(symbols).map(([symbol, stats]) => ({
                        date,
                        symbol,
                        ...stats,
                    }))
                );

                // const transformedData = Object.entries(serverResponse.overallAverage).map(([symbol, stats]) => ({
                //     symbol,
                //     ...stats,
                // }));
                setAverageData(transformedData);
            }


            setActiveTabStatus(true);

            // ===== Reorder Columns =====
            const preferredOrder = [
                "SYMBOL", "DELIV_QTY", "DELIV_PER", "TTL_TRD_QNTY", "AVG_PRICE", "CLOSE_PRICE", "LAST_PRICE",
                "DATE1", "SERIES", "PREV_CLOSE", "OPEN_PRICE", "HIGH_PRICE", "LOW_PRICE", "TURNOVER_LACS", "NO_OF_TRADES"
            ];

            const reorderedData = data.map((item) => {
                const reorderedItem = {};
                preferredOrder.forEach((key) => {
                    if (item.hasOwnProperty(key)) reorderedItem[key] = item[key];
                });
                Object.keys(item).forEach((key) => {
                    if (!reorderedItem.hasOwnProperty(key)) reorderedItem[key] = item[key];
                });
                return reorderedItem;
            });

            // ===== Detect Grouping Need =====
            const symbolCount = {};
            reorderedData.forEach(({ SYMBOLS }) => {
                const symbol = SYMBOLS?.trim();
                if (symbol) symbolCount[symbol] = (symbolCount[symbol] || 0) + 1;
            });
            const duplicateSymbols = Object.entries(symbolCount).filter(([_, count]) => count > 1).map(([s]) => s);
            const isGroupingNeeded = duplicateSymbols.length > 0;

            // ===== Generate Column Definitions =====
            const keys = Object.keys(reorderedData[0]);
            const dynamicCols = keys.map((key) => ({
                headerName: key.replace(/_/g, ' ').toUpperCase(),
                field: key,
                sortable: true,
                filter: true,
                width: 140,
                rowGroup: key === "SYMBOL" && isGroupingNeeded,
                hide: key === "SYMBOL" && isGroupingNeeded,
            }));

            setColumnDefs(dynamicCols);
            setRowData(reorderedData);

            // ===== Average Table Columns =====

            setAvgColumnDefs([
                { field: 'symbol', headerName: 'SYMBOLS', filter: true, flex: 1 },
                { field: 'DELIV_QTY_avg', headerName: 'DELIVERY QUANTITY AVG', flex: 1 },
                { field: 'DELIV_QTY_percentage', headerName: 'DELIVERY QUANTITY %', filter: Custom_AGFilter, flex: 1, cellStyle: params => getCellStyle(params) },
                { field: 'TTL_TRD_QNTY_avg', headerName: 'TTL TRD QNTY AVG', flex: 1 },
                { field: 'TTL_TRD_QNTY_percentage', headerName: 'TTL TRD QNTY %', filter: Custom_AGFilter, flex: 1 },
            ]);

            // ===== Alerts Handling =====
            if (Array.isArray(serverResponse.alerts)) {
                const displayLimit = 5;
                const alerts = serverResponse.alerts;
                const messages = alerts.slice(0, displayLimit).map(a => a.message);
                toast.success(messages.join("\n"));
                if (alerts.length > displayLimit) {
                    toast.info(`+${alerts.length - displayLimit} more alerts`);
                }
            }

        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };


    // const getRequestDataBasedUponDate = async (updatedDateHandler) => {
    //     try {
    //         setIsLoading(true);
    //         setError('');
    //         setNoDataFoundMsg('');
    //         const serverResponse = await apiService.fetchCSVDataFromDateRequest('/request-date', updatedDateHandler);
    //         const mergedData = serverResponse.mergedData || [];

    //         if (mergedData.length === 0) {
    //             setNoDataFoundMsg('No data found for the selected date.');
    //             setRowData([]);
    //             setColumnDefs([]);
    //             return;
    //         }
    //         setActiveTabStatus(true)
    //         // 1) Build dynamic columns off the first row's keys
    //         const keys = Object.keys(mergedData[0]);
    //         const dynamicCols = keys.map((key) => ({
    //             headerName: key.replace(/_/g, ' ').toUpperCase(),
    //             field: key,
    //             sortable: true,
    //             filter: true,
    //             flex: 1,
    //         }));

    //         // 2) (Optional) Reorder columns to your preferred order
    //         const preferredOrder = [
    //             "SYMBOL",
    //             "DELIV_QTY",
    //             "DELIV_PER",
    //             "TTL_TRD_QNTY",
    //             "AVG_PRICE",
    //             "CLOSE_PRICE",
    //             "LAST_PRICE",
    //             "DATE1",
    //             "SERIES",
    //             "PREV_CLOSE",
    //             "OPEN_PRICE",
    //             "HIGH_PRICE",
    //             "LOW_PRICE",
    //             "TURNOVER_LACS",
    //             "NO_OF_TRADES"
    //         ];
    //         const reorderedCols = [
    //             ...preferredOrder
    //                 .filter(k => keys.includes(k))
    //                 .map(k => dynamicCols.find(c => c.field === k)),
    //             // then any leftover columns
    //             ...dynamicCols.filter(c => !preferredOrder.includes(c.field))
    //         ];
    //         // 3) Push into state
    //         setColumnDefs(reorderedCols);
    //         setRowData(mergedData);

    //         // --- now do the same for your average tab ---
    //         const avgArray = Object.entries(serverResponse.overallAverage).map(
    //             ([symbol, stats]) => ({ symbol, ...stats })
    //         );
    //         setAverageData(avgArray);
    //         setAvgColumnDefs([
    //             { field: 'symbol', headerName: 'SYMBOL' },
    //             { field: 'DELIV_QTY_avg', headerName: 'DELIVERY QTY AVG' },
    //             { field: 'DELIV_QTY_percentage', headerName: 'DELIVERY QTY %', filter: Custom_AGFilter },
    //             { field: 'TTL_TRD_QNTY_avg', headerName: 'TTL TRD QTY AVG' },
    //             { field: 'TTL_TRD_QNTY_percentage', headerName: 'TTL TRD QTY %', filter: Custom_AGFilter }
    //         ]);


    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    const defaultColDef = useMemo(() => ({
        resizable: true,
        sortable: true,
        filter: true,
    }), []);

    const autoGroupColumnDef = {
        headerName: 'Symbol Group',
        field: 'SYMBOL',
        cellRendererParams: {
            suppressCount: false,
        },
    };
    const groupRowRendererParams = {
        suppressCount: true,
    };

    // Handle Tab Switch
    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    const getYesterdayDate = () => {
        const today = new Date();
        today.setDate(today.getDate() - 1); // Go back one day
        return today.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    };


    if (isLoading) { return <div className='flex justify-center items-center h-screen'><Loading msg={'Loading... please wait'} /></div> }
    // if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    return (

        <div className='p-4 bg-gray-50'>
            <div className='flex justify-start gap-3 items-center mb-4'>
                {/* <div className='w-1/5 relative select-none bg-white'>
                    <input onChange={dateChangeHandler} value={dateHandler.from_date} type="date" id='from_date' name='from_date' placeholder='From Date' className='for_input peer' />
                    <label htmlFor="from_date" className='for_label'>From Date</label>
                </div> */}
                <div className='w-1/5 relative select-none bg-white'>
                    <input max={getYesterdayDate()} onChange={dateChangeHandler} value={dateHandler.to_date} type="date" id='to_date' name='to_date' placeholder='To Date' className='for_input peer' />
                    <label htmlFor="to_date" className='for_label'>To Date</label>
                </div>
            </div>
            {activeTabStatus &&
                <div className='flex flex-col gap-2 mb-2'>
                    {/* Tab Switcher */}
                    <div className="flex gap-2 items-center">
                        <div className="flex">
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'fetch' ? 'bg-blue-600 text-white' : 'bg-gray-300'} rounded-l`}
                                onClick={() => switchTab('fetch')}
                                children={'Fetch Data'}
                            />
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'average' ? 'bg-blue-600 text-white' : 'bg-gray-300'} rounded-r`}
                                onClick={() => switchTab('average')}
                                children={'Average'}
                            />
                        </div>
                        {/* Date Tabs */}
                        {activeTab === 'average' &&
                            <div className="flex flex-wrap gap-2">
                                {dateTabs?.map((date) => (
                                    <Button
                                        key={date}
                                        className={`px-3 py-1 text-sm font-semibold rounded ${dateHandler.to_date === date ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                                        onClick={() => handleAverageDateChange(date)}
                                        children={date}
                                    />
                                ))}
                            </div>
                        }
                    </div>

                </div>
            }

            {/* {isLoading && <div className='flex justify-center items-center min-h-screen'> <Loading msg='Loading... please wait' /></div>} */}
            {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
            {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
            {!dateHandler.from_date && !dateHandler.to_date && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: Please Select Date first</span></div>}

            {!isLoading && !error && !noDataFoundMsg && dateHandler.to_date && (
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