import React, { useState } from 'react'

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Loading from '../../../Loading';

const FundDeliveryDashboard = () => {
    const [category, setCategory] = useState('daily-spurts');

    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);

    // Loading 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');


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

    const fetchData = async (type) => {
        console.log(type);
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');

        try {
            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/fetch-data', { type });
            // console.log(serverResponse);

            if (type === 'large-cap' || type === 'mid-cap' || type === 'small-cap') {
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
            } else if (type === 'daily-spurts') {
                setRowData(serverResponse.data?.higher);
                const dynamicColumns = Object.keys(serverResponse.data?.higher[0]).map(key => ({
                    headerName: key,
                    field: key,
                    sortable: true,
                    filter: true,
                    resizable: true,
                    // cellStyle: params => getCellStyle(params),
                }));
                setColumnDefs([...dynamicColumns]);
            } else {
                setNoDataFoundMsg('No data found for the selected option.');
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    const handleCategoryChange = (newCategory) => {
        // console.log(newCategory)
        setCategory(newCategory);
        fetchData(newCategory);
    };
    return (
        <>
            <div className="flex gap-2 mb-3">
                {['daily-spurts', 'large-cap', 'mid-cap', 'small-cap'].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleCategoryChange(type)}
                        className={`px-2 py-1 font-medium rounded ${category === type ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {type.replace('-', ' ').toUpperCase()}
                    </button>
                ))}
            </div>
            {isLoading && <Loading msg='Loading... please wait' />}
            {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
            {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
            {!isLoading && !error && !noDataFoundMsg && (
                <div className="ag-theme-alpine h-[70vh] w-full">
                    <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination={true} />
                </div>
            )}
        </>
    )
}

export default FundDeliveryDashboard