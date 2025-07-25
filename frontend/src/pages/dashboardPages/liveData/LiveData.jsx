import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BACKEND_URI, apiService } from '../../../services/apiService';
import * as RiIcons from 'react-icons/ri';
import io from 'socket.io-client';
import Loading from '../../../Loading';
import DeleteLiveNSEDataModal from '../../../components/dashboardPageModal/liveNSEStockModal/DeleteLiveNSEDataModal';
import { useLocation } from 'react-router-dom';

// const backendURL = import.meta.env.VITE_BACKEND_URI;
const socket = io(BACKEND_URI, { withCredentials: true });

const LiveData = () => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLive, setLiveError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const location = useLocation();
    // Extract path from URL
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const currentPath = pathSegments[pathSegments.length - 1]; // Get the last segment

    const isLiveData = currentPath.toLowerCase() === 'live-data'; // check

    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

    const customCellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 0',
        height: "20px",
        width: '80px',
        marginTop: '7px',
        marginRight: 'auto',
        marginLeft: '15px',
        color: 'white',
        textAlign: 'center'
    }

    function getCellStyle(params) {
        const value = params.value;

        // Handle missing or invalid values
        if (value === '-' || value === '' || value == null || isNaN(value)) {
            return {
                backgroundColor: 'black',
                color: 'white',
                fontStyle: 'italic',
                ...customCellStyle,
            };
        }

        const numValue = Number(value);

        // Style based on volume %
        if (numValue <= 30) {
            return { backgroundColor: 'red', color: 'white', ...customCellStyle };
        }

        if (numValue > 30 && numValue < 60) {
            return { backgroundColor: 'orange', color: 'black', ...customCellStyle };
        }

        if (numValue >= 60) {
            return { backgroundColor: 'green', color: 'white', ...customCellStyle };
        }

        return null; // Default
    }

    const deleteOperation = (paramData) => {
        const deletingPath = 'live-data-delete'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }


    const [columnDefs] = useState([
        ...(!isLiveData ? [{
            headerName: "Action", pinned: 'left', field: 'action', maxWidth: 100,
            cellRenderer: (params) => (
                <div className="flex justify-between">
                    <div onClick={() => deleteOperation(params.data)} className="ag_table_delete py-1 my-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded">
                        <RiIcons.RiDeleteBin3Line className="text-2xl" />
                    </div>
                </div>
            )
        }] : []),
        {
            headerName: "STOCKNAME", field: 'stockName', pinned: 'left', maxWidth: 160, filter: true
        },
        {
            headerName: "Volume(%)", field: 'volumePercent', maxWidth: 140, filter: true, cellStyle: getCellStyle
        },
        {
            headerName: "Regular Market(%)", field: 'regularMarketVolume', maxWidth: 180
        },
        {
            headerName: "Average Daily 10Day(%)", field: 'averageDailyVolume10Day', maxWidth: 180
        },
        {
            headerName: "Current Price", field: 'currentMarketPrice', maxWidth: 180
        },
        {
            headerName: "Market Day Low", field: 'regularMarketDayLow', maxWidth: 180
        },
        {
            headerName: "Market Open", field: 'regularMarketOpen', maxWidth: 180
        },
        {
            headerName: "Market Change", field: 'regularMarketChange', maxWidth: 180
        },
        {
            headerName: "Market Change(%)", field: 'regularMarketChangePercent', maxWidth: 180
        },
        {
            headerName: "Prev Close price", field: 'previousMarketClosePrice', maxWidth: 180
        },
        {
            headerName: "52 Week High", field: 'fiftyTwoWeekHigh', maxWidth: 180
        },
        {
            headerName: "52 Week Low", field: 'fiftyTwoWeekLow', maxWidth: 180
        },
        {
            headerName: "52 Week High Change", field: 'fiftyTwoWeekHighChange', maxWidth: 180
        },
        {
            headerName: "52 Week High Change(%)", field: 'fiftyTwoWeekHighChangePercent', maxWidth: 180
        },
        {
            headerName: "52 Week Low Change", field: 'fiftyTwoWeekLowChange', maxWidth: 180
        },
        {
            headerName: "52 Week Low Change(%)", field: 'fiftyTwoWeekLowChangePercent', maxWidth: 180
        },
        {
            headerName: "52 Week Change(%)", field: 'fiftyTwoWeekChangePercent', maxWidth: 180
        },
    ]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);

    // const getLiveNSEData = async () => {
    //     setIsLoading(true);
    //     setLiveError('');
    //     setNoDataFoundMsg('');
    //     try {

    //         const serverResponse = await apiService.getInfoFromServer('/google-finanace-live-data')
    //         if (serverResponse.length > 0) {
    //             setRowData(serverResponse)
    //         } else {
    //             setNoDataFoundMsg('No data found for the selected option.');
    //         }
    //     } catch (err) {
    //         setLiveError(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            setIsLoading(true);
            setLiveError('');
            setNoDataFoundMsg('');

            try {
                const serverResponse = await apiService.getInfoFromServer('/google-finanace-live-data');
                if (isMounted) {
                    if (serverResponse.length > 0) {
                        setRowData(serverResponse);
                    } else {
                        setNoDataFoundMsg('No data found for the selected option.');
                    }
                }
            } catch (err) {
                if (isMounted) {
                    setLiveError(err.message);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchInitialData(); // 👈 First call

        return () => {
            isMounted = true;
        };
    }, []); // runs only once on mount



    // [ WEBSOCKET CALL ]
    useEffect(() => {
        socket.on('liveStockData', (data) => {
            setRowData(data); // update instantly when backend sends
        });

        return () => {
            socket.off('liveStockData');
        };
    }, []);

    return (
        <>
            {isLoading && <Loading msg='Loading... please wait' />}
            {errorLive && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorLive}</span></div>}
            {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
            {!isLoading && !errorLive && !noDataFoundMsg && (
                <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        pagination={true}
                        rowSelection="multiple"
                        paginationPageSize={100}
                    />
                </div>

            )}

            <DeleteLiveNSEDataModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} data={isDeletingId} />
        </>
    )
}

export default LiveData