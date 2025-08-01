import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { apiService } from '../../../../services/apiService';
import Loading from '../../../../Loading';

const LargeCapStock = ({ useWeight }) => {
    const [largeCapStockLists, setLargeCapStockLists] = useState([])
    // ERROR HANDLING
    const [errorMsg, setErrorMsg] = useState('')
    const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const customCellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 0',
        width: '80px',
        height: "20px",
        marginTop: '7px',
        marginRight: 'auto',
        marginLeft: '10px',
        color: 'white',

    }
    const getCellStyle = params => {
        const value = params.value;

        if (value === 'New') {
            return { backgroundColor: '#d1e7dd', fontWeight: 'bold', ...customCellStyle }; // light green
        }
        if (params.value < 0) {
            return { backgroundColor: 'red', ...customCellStyle };
        }
        if (params.value == 0) { return { backgroundColor: 'lightgray', ...customCellStyle } };
        if (params.value <= 3) { return { backgroundColor: 'orange', ...customCellStyle } };
        if (params.value >= 4) { return { backgroundColor: 'green', ...customCellStyle } };
    };


    const [columnDefss] = useState([
        { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 250 },
        //{ headerName: 'Apr-24', field: 'Apr24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'May-24', field: 'May24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Jun-24', field: 'Jun24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Jul-24', field: 'Jul24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Aug-24', field: 'Aug24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Sep-24', field: 'Sep24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Oct-24', field: 'Oct24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Nov-24', field: 'Nov24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Dec-24', field: 'Dec24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
    ]);

    const [columnDefs, setColumnDefs] = useState([])

    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    const fetchLargeStockLists = async () => {
        setIsLoading(true)
        try {
            const largerStocklists = await apiService.getInfoFromServer('/large-cap')
            const customData = largerStocklists.map(stock => ({
                stockName: stock.stockName,
                // Jan24: stock.monthlyData[0],
                // Feb24: stock.monthlyData[1],
                // Mar24: stock.monthlyData[2],
                // Apr24: stock.monthlyData[3],
                May24: stock.monthlyData[0],
                Jun24: stock.monthlyData[1],
                Jul24: stock.monthlyData[2],
                Aug24: stock.monthlyData[3],
                Sep24: stock.monthlyData[4],
                Oct24: stock.monthlyData[5],
                Nov24: stock.monthlyData[6],
                Dec24: stock.monthlyData[7],
            }));
            setLargeCapStockLists(customData);
            setErrorMsgStatus(false)
            setIsLoading(false)
        } catch (err) {
            setErrorMsgStatus(true)
            setErrorMsg(err.message)
            setIsLoading(false)

        }
    }

    const getCapMergeFile = async () => {
        setIsLoading(true);
        setErrorMsg('');
        // setNoDataFoundMsg('');

        const params = { cap: 'LARGECAP' };

        if (!useWeight) {
            params.weightType = 'none'; // 🔥 only when unchecked
        }

        try {
            const serverResponse = await apiService.fetchCSVDataFromDateRequest('/cap', params)
            const serverResponseData = serverResponse.response

            if (!serverResponseData?.length) {
                setLargeCapStockLists([]);
                setColumnDefs([]);
                setErrorMsgStatus(true);
                setErrorMsg('No data found for the LARGE CAP option.');
                return;
            }

            setLargeCapStockLists(serverResponseData)

            const dynamicCols = []

            const today = new Date();
            const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jun'
            const currentYear = String(today.getFullYear()).slice(2);              // e.g., '25'
            const currentHeader = `${currentMonth}${currentYear} `;

            if (serverResponse.monthsHeader.length > 0) {
                const monthlyChildren = serverResponse.monthsHeader
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

                        return parse(a) - parse(b); // Descending order
                    }).map((month) => ({
                        headerName: month,
                        field: month.replace(/-/g, ''),
                        sortable: true,
                        filter: true,
                        maxWidth: 120,
                        cellStyle: params => getCellStyle(params),
                        valueFormatter: (params) => {
                            const value = params.value;
                            if (typeof value === 'string' && value.trim().toLowerCase() === 'new') {
                                return 'New';
                            }
                            return value; // fallback
                        }
                    }));

                dynamicCols.push({
                    headerName: 'Monthly Data',
                    marryChildren: true,
                    children: monthlyChildren,
                });
            }
            // Add 'Stock Name' column as the first column
            const columnDefs = [
                { headerName: 'STOCKNAME', field: 'stockName', sortable: true, filter: true, maxWidth: 150 },
                ...dynamicCols,
            ];

            setColumnDefs(columnDefs);
            setErrorMsgStatus(false)
            setErrorMsg('');
            // else {
            //     setNoDataFoundMsg('No data found for the LARGE CAP option.');
            // }

        } catch (err) {
            setErrorMsgStatus(true)
            setErrorMsg(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        // fetchLargeStockLists()
        getCapMergeFile()
    }, [useWeight])

    if (isLoading) { return <div><Loading msg={'Loading... please wait'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    return (
        <>
            <div className='ag-theme-alpine shadow w-full h-[70vh] overflow-y-auto'>
                <AgGridReact rowData={largeCapStockLists} columnDefs={columnDefs}
                    defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100}
                    groupDisplayType='groupRows' />
            </div>
        </>
    )
}

export default LargeCapStock