import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { apiService } from '../../../../services/apiService';
import Loading from '../../../../Loading';



const FMCG = () => {
    const [rowData, setRowData] = useState([]);
    // const [columnDefs, setColumnDefs] = useState([]);
    const [getBankDataDetails, setGetBankDataDetails] = useState([])

    // ERROR HANDLING
    const [errorMsg, setErrorMsg] = useState('')
    const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const columnDefs = [
        {
            headerName: 'FMCG Product Name',
            children: [
                { headerName: 'PRODUCT NAME', field: 'productName' },
            ],
        },
        {
            headerName: 'FMCG value',
            children: [
                { headerName: 'Brand', field: 'brand' },
                { headerName: 'Category', field: 'category' },
                { headerName: 'Price', field: 'price' },
                { headerName: 'Stock Value', field: 'stock' },
            ],
        },
    ];

    const fetchingApi = async () => {
        setIsLoading(true)
        try {
            const getBankData = await apiService.getInfoFromServer('/fmcg');
            setRowData(getBankData)
            setErrorMsgStatus(false)
            setIsLoading(false)
        } catch (err) {
            setErrorMsgStatus(true)
            setErrorMsg(err.message)
            setIsLoading(false)
        }

    }
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);
    useEffect(() => {
        fetchingApi();
    }, []);
    if (isLoading) { return <div><Loading msg={'Loading... please wait'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }

    return (
        <>
            <div className="ag-theme-alpine shadow w-full h-[77vh] overflow-y-auto">
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    pagination={true}
                />
            </div>
        </>
    )
};

export default FMCG;
