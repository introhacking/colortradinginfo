import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
// import { smallCapTableHeading } from '../../../row_Column_Config/smallCaps';
import { bankingService } from '../../../../services/bankingService';
import Loading from '../../../../Loading';


const SmallCapStock = () => {
    const [smallCapStockLists, setSmallCapStockLists] = useState([])

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
        if (params.value < 0) {
            return { backgroundColor: 'red', ...customCellStyle };
        }
        if (params.value == 0) { return { backgroundColor: 'lightgray', ...customCellStyle } };
        if (params.value <= 3) { return { backgroundColor: 'orange', ...customCellStyle } };
        if (params.value >= 4) { return { backgroundColor: 'green', ...customCellStyle } };
    };


    // useEffect(() => {
    //     const savedSmallCapsData = localStorage.getItem('largeCaps');
    //     const customData = JSON.parse(savedSmallCapsData)
    //     setSmallCapStockLists(customData.map(stock => ({
    //         stockName: stock.stockName,
    //         Jan24: stock.monthlyData[0],
    //         Feb24: stock.monthlyData[1],
    //         Mar24: stock.monthlyData[2],
    //         Apr24: stock.monthlyData[3],
    //         May24: stock.monthlyData[4],
    //         Jun24: stock.monthlyData[5],
    //         Jul24: stock.monthlyData[6],
    //         Aug24: stock.monthlyData[7],
    //         Sep24: stock.monthlyData[8],
    //         Oct24: stock.monthlyData[9],
    //         Nov24: stock.monthlyData[10],
    //         Dec24: stock.monthlyData[11],
    //     })));
    // }, [])

    const [columnDefs] = useState([
        { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 250 },
       // { headerName: 'Apr-24', field: 'Apr24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'May-24', field: 'May24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Jun-24', field: 'Jun24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Jul-24', field: 'Jul24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Aug-24', field: 'Aug24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Sep-24', field: 'Sep24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Oct-24', field: 'Oct24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Nov-24', field: 'Nov24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
        { headerName: 'Dec-24', field: 'Dec24', sortable: true, filter: true, maxWidth: 100, cellStyle: params => getCellStyle(params) },
    ]);
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);


    const fetchLargeStockLists = async () => {
        setIsLoading(true)
        try {
            const midStocklists = await bankingService.getInfoFromServer('/small-cap')
            const customData = midStocklists.map(stock => ({
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
            setSmallCapStockLists(customData);
            setErrorMsgStatus(false)
            setIsLoading(false)
        } catch (err) {
            setErrorMsgStatus(true)
            setErrorMsg(err.message)
            setIsLoading(false)

        }
    }
    useEffect(() => {
        fetchLargeStockLists()
    }, [])



    // const getCellStyle = params => {
    //     const value = params.value;
    //     const color = 'green'; 
    //     const percentage = Math.max(0, Math.min(value, 1)) * 100; 

    //     return {
    //         background: `linear-gradient(to right, ${color} ${percentage}%, white ${percentage}%)`,
    //         color: 'white'
    //     };
    // };


    // // Define month headers
    // const [monthHeaders] = useState(smallCapTableHeading);

    // // Function to generate column definitions
    // const generateColumnDefs = () => {
    //     const baseColumns = [
    //         { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 250 }
    //     ];

    //     const monthColumns = monthHeaders.map(month => ({
    //         headerName: month,
    //         field: month.replace('-', ''), // Remove '-' for field names
    //         sortable: true,
    //         filter: true,
    //         maxWidth: 100,
    //         cellStyle: params => getCellStyle(params)
    //     }));

    //     return [...baseColumns, ...monthColumns];
    // };

    // const [columnDefs] = useState(generateColumnDefs);

    // const defaultColDef = useMemo(() => ({
    //     sortable: true
    // }), []);
    if (isLoading) { return <div><Loading msg={'Loading... please wait'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    return (
        <>
            {/* <div>
                <table>
                    <tr className='sticky top-0 bg-white shadow-md'>
                        <th>Stock Name : Small Caps</th>
                    </tr>

                    <tbody>
                        {
                            smallCapStockLists?.map((item, index) => {
                                return <tr key={index}>
                                    <td className='text-sm'>{item.stockName}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </table>

            </div> */}


            <div className='ag-theme-alpine shadow w-full h-[80vh] overflow-y-auto'>
                <AgGridReact rowData={smallCapStockLists} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
            </div>


        </>
    )
}

export default SmallCapStock