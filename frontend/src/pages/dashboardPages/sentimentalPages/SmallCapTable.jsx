import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import * as BiIcons from 'react-icons/bi'
import * as RiIcons from 'react-icons/ri'
import * as ImIcons from 'react-icons/im'
import SmallCap_Edit_Modal from '../../../components/dashboardPageModal/smallCapModal/SmallCap_Edit_Modal';
import SmallCap_Info_Modal from '../../../components/dashboardPageModal/smallCapModal/SmallCap_Info_Modal';
import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';
import { toast } from 'sonner'
import Loading from '../../../Loading';

const SmallCapTable = () => {
    const [rowData, setRowData] = useState([{}]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});
    const [scrubbingButtonStatus, setScrubbingButtonStatus] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');
    const [rowData1, setRowData1] = useState([]);
    const [columnDefs1, setColumnDefs1] = useState([]);

    const [activeTab, setActiveTab] = useState('show_SmallCap');
    const [switchToTable, setSwitchToTable] = useState(false)

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }
    const deleteConfirmationModal = (paramData) => {
        const deletingPath = 'small-cap'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }

    const [columnDefsss] = useState([
        {
            headerName: "Action", field: 'action', flex: 1, maxWidth: 140, pinned: 'left',
            // checkboxSelection: true,
            cellRenderer: (params) => {
                return (
                    <div className="flex justify-between">
                        <div
                            onClick={() => updateBankInfo(params.data)}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            {/* Edit */}
                            <Button children={<BiIcons.BiEdit className="text-2xl" />} className={'button ag_table_edit_button'} type={'button'} />
                        </div>
                        <div
                            onClick={() => {
                                deleteConfirmationModal(params.data);
                            }}
                            className="py-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded"
                        >
                            <Button children={<RiIcons.RiDeleteBin3Line className="text-2xl" />} className={'button button_cancel'} type={'button'} />
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Stock Name", field: 'stockName', filter: true, flex: 1, maxWidth: 350
        },
        {
            headerName: "Monthly Data", field: 'monthlyData', flex: 1
        },
    ]);

    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    // Handle Tab Switch
    const switchTab = (tab) => {
        if (tab === 'show_SmallCap') {
            setActiveTab(tab);
            setSwitchToTable(false)
        }
        if (tab === 'show_ScrubSmallCap') {
            setActiveTab(tab);
            setSwitchToTable(true)
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const serverResponse = await bankingService.getInfoFromServer('/small-cap');
            if (serverResponse.length > 0) {
                setRowData(serverResponse)
            }
            else {
                setNoDataFoundMsg('No data found for the SMALL CAP option.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }


    const exportDataFromSmallCapUrl = async () => {
        setScrubbingButtonStatus(true)
        try {
            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/exports-data', { cap: 'SMALLCAP' })
            if (serverResponse.status) {
                toast.success(serverResponse.message)
                newFetchingAPI()
            }
        } catch (err) {

        } finally {
            setScrubbingButtonStatus(false)
        }
    }

    const newFetchingAPI = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/cap-file', { cap: 'SMALLCAP' })
            if (serverResponse.success && serverResponse.length > 0) {
                setRowData1(serverResponse.data);
                const dynamicColumns = Object.keys(serverResponse.data[0]).map(key => ({
                    headerName: key,
                    field: key,
                    sortable: true,
                    filter: true,
                    resizable: true,
                }));

                const actionColumn = {
                    headerName: "Action",
                    field: 'action',
                    maxWidth: 140,
                    pinned: 'left',
                    cellRenderer: (params) => (
                        <div className="flex justify-between">
                            <div
                                onClick={() => updateBankInfo(params.data)}
                                className="py-1 px-2 cursor-pointer rounded"
                            >
                                <Button
                                    children={<BiIcons.BiEdit className="text-2xl" />}
                                    className="button ag_table_edit_button"
                                    type="button"
                                />
                            </div>
                            <div
                                onClick={() => deleteConfirmationModal(params.data)}
                                className="py-1 px-2 cursor-pointer rounded"
                            >
                                <Button
                                    children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
                                    className="button button_cancel"
                                    type="button"
                                />
                            </div>
                        </div>
                    )
                };

                setColumnDefs1([actionColumn, ...dynamicColumns]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    function getCellStyle(params) {
        const value = params.value;

        if (typeof value === 'string' && value.trim().toLowerCase() === 'new') {
            return { backgroundColor: '#4561a3', fontWeight: 'bold', color: 'white', textAlign: 'center' }; // yellow highlight
        }
    }

    const getCapMergeFile = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const serverResponse = await bankingService.fetchCSVDataFromDateRequest('/cap', { cap: 'SMALLCAP' })
            // console.log(serverResponse)
            const serverResponseData = serverResponse.response
            if (serverResponseData?.status === 500) {
                setError(serverResponseData.message);
            }

            if (serverResponseData?.length > 0) {
                setRowData(serverResponseData)
            }
            const dynamicCols = []
            if (serverResponse.monthsHeader.length > 0) {
                const monthlyChildren = serverResponse.monthsHeader.map((month) => ({
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
            } else {
                setNoDataFoundMsg('No data found for the SMALL CAP option.');
            }
            // Add 'Stock Name' column as the first column
            const columnDefs = [
                { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 150 },
                ...dynamicCols,
            ];

            setColumnDefs(columnDefs)


        } catch (err) {
            // console.log(err)
            // setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }


    const handleExportToExcel = () => {
        try {
            const allVisibleColumns = gridRef.current.columnApi.getAllDisplayedColumns();
            const columnKeys = allVisibleColumns.map(col => col.getColId());
            gridRef.current.api.exportDataAsCsv({
                fileName: 'SmallCapCSVData.csv',
                columnKeys: columnKeys,
            });
        } catch (err) {
            console.log(err)

        }
    };


    useEffect(() => {
        if (activeTab === 'show_SmallCap') {
            // fetchData();
            getCapMergeFile()
        }
        if (activeTab === 'show_ScrubSmallCap') {
            newFetchingAPI();
        }
    }, [activeTab])

    return (
        <>
            <div className='flex justify-between flex-col gap-3'> {/* h-full */}
                {/* <div>
                    Small Cap
                </div> */}
                <div className='flex justify-between gap-2 items-center'>
                    <div className='flex items-center gap-2'>
                        {/* <Button onClick={() => setIsAlertModalOpen(true)} children={'Delete All Table Data'} className={`${rowData1.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"} `} disabled={rowData.length > 0 ? false : true} /> */}
                        <div className="flex">
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'show_SmallCap' ? 'bg-purple-600 text-white' : 'bg-purple-300'
                                    } rounded-l`}
                                onClick={() => switchTab('show_SmallCap')}
                                children={'Show SmallCap Data'}
                            />
                            <Button
                                className={`px-3 py-1 text-sm font-semibold ${activeTab === 'show_ScrubSmallCap' ? 'bg-purple-600 text-white' : 'bg-purple-300'
                                    } rounded-r`}
                                onClick={() => switchTab('show_ScrubSmallCap')}
                                children={'Show Scrub Data'}
                            />
                        </div>
                    </div>
                    <div className='flex justify-between gap-2'>
                        <Button onClick={handleExportToExcel} children={'Export to CSV'} className={'button hover:bg-green-400 bg-green-500 text-white '} />

                        <Button
                            onClick={exportDataFromSmallCapUrl}
                            disabled={scrubbingButtonStatus}
                            className={`${scrubbingButtonStatus ? 'button cursor-not-allowed opacity-50' : ''}  button button_video text-white`}
                        >
                            {scrubbingButtonStatus ? (
                                <div className="flex items-center">
                                    <ImIcons.ImSpinner9 className="mx-2 text-xl animate-spin" />
                                    Scraping Please wait...
                                </div>
                            ) : (
                                'Scraping SmallCap Data'
                            )}
                        </Button>

                        {/* <Button onClick={() => setIsModalOpen(true)} children={'Add SmallCap Info'} className={'button hover:bg-green-400 bg-green-500 text-white '} /> */}

                    </div>
                </div>
                {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
                {!isLoading && !error && !noDataFoundMsg && (
                    <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                        {/* <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} /> */}
                        {/* <AgGridReact rowData={rowData1} columnDefs={columnDefs1} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} /> */}
                        {!switchToTable && (
                            < AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
                        )}

                        {switchToTable && (
                            <AgGridReact
                                rowData={rowData1}
                                columnDefs={columnDefs1}
                                defaultColDef={defaultColDef}
                                animateRows={true}
                                pagination={true}
                                paginationPageSize={100}
                            />
                        )}

                    </div>
                )}
            </div>

            <SmallCap_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={'small_cap'} />
            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} />
            <SmallCap_Edit_Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} />
        </>
    );
};

export default SmallCapTable;
