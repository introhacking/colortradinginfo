import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React, { useEffect, useMemo, useState } from 'react';
import * as BiIcons from 'react-icons/bi'
import * as RiIcons from 'react-icons/ri'
import Button from '../../../components/componentLists/Button';
import { bankingService } from '../../../services/bankingService';
import Loading from '../../../Loading';
import Research_Add_Modal from '../../../components/dashboardPageModal/researchModal/Research_Add_Modal';
import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';
import Preview from '../../../components/dashboardPageModal/researchModal/Preview';
import Research_Edit_Modal from '../../../components/dashboardPageModal/researchModal/Research_Edit_Modal';

import { useLocation } from 'react-router-dom';


const Research = () => {
    const [rowData, setRowData] = useState([{}]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLive, setLiveError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    const useExactPath = (target) => {
        const { pathname } = useLocation();
        return pathname === target;
    };

    const isDashboardResearch = useExactPath('/dashboard/research');

    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isPreviewData, setIsPreviewData] = useState({});

    const updateFunction = (paramData) => {
        // console.log(paramData)
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = 'research'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }
    const previewModal = (paramData) => {
        setIsPreviewData({ ...paramData })
        setIsPreviewModalOpen(true)
    }

    const [columnDefs] = useState([
        ...(isDashboardResearch ? [{
            headerName: "Action", field: 'action', pinned: 'left', maxWidth: 190,
            cellRenderer: (params) => {
                return (
                    <div className="flex justify-between">
                        <div
                            onClick={() => {
                                previewModal(params.data);
                            }}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            <Button children={<RiIcons.RiEyeFill className="text-2xl" />} className={'button button_video'} type={'button'} />
                        </div>
                        <div
                            onClick={() => updateFunction(params.data)}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            <Button children={<BiIcons.BiEdit className="text-2xl" />} className={'button ag_table_edit_button'} type={'button'} />
                        </div>
                        <div
                            onClick={() => {
                                deleteConfirmationModal(params.data);
                            }}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            <Button children={<RiIcons.RiDeleteBin3Line className="text-2xl" />} className={'button button_cancel'} type={'button'} />
                        </div>
                    </div>
                );
            },
        }] : [
            {
                headerName: "Action", field: 'action', pinned: 'left', maxWidth: 80,
                cellRenderer: (params) => {
                    return (
                        <div
                            onClick={() => {
                                previewModal(params.data);
                            }}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            <Button children={<RiIcons.RiEyeFill className="text-2xl" />} className={'button button_video'} type={'button'} />
                        </div>
                    );
                },
            }
        ]),
        {
            headerName: "Stock Name", filter: true, field: 'stockName'
        },
        {
            headerName: "Buy-Sell", filter: true, field: 'buy_sell'
        },
        {
            headerName: "Trigger Price", filter: true, field: 'trigger_price'
        },
        {
            headerName: "Target Price", filter: true, field: 'target_price'
        },
        {
            headerName: "Stop-Loss", filter: true, field: 'stop_loss'
        },
        {
            headerName: "Rationale", field: 'rationale', valueFormatter: (params) => {
                const htmlString = params.value || '';
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlString;
                return tempDiv.textContent || tempDiv.innerText || '';
            }
        },
    ]);
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);

    const fetchingApi = async () => {
        setIsLoading(true);
        setLiveError('');
        setNoDataFoundMsg('');
        try {
            const getBankData = await bankingService.getInfoFromServer('/research');
            if (getBankData.length > 0) {
                setRowData(getBankData)
            } else {
                setNoDataFoundMsg('No data found ')
            }
        } catch (err) {
            setLiveError(err.message);
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        fetchingApi();
    }, [])

    return (
        <>
            <div className='flex justify-between flex-col gap-3'>

                {isDashboardResearch &&
                    <div className='flex justify-end'>
                        <Button onClick={() => setIsModalOpen(true)} children={'Add Research Details'} className={'button hover:bg-green-400 bg-green-500 text-white '} />
                    </div>
                }

                {isLoading && <Loading msg='Loading... please wait' />}
                {errorLive && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorLive}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
                {!isLoading && !errorLive && !noDataFoundMsg && (
                    <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                        <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
                    </div>
                )}
            </div>
            <Research_Add_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refresh={fetchingApi} />
            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} refresh={fetchingApi} />
            <Preview isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} isPreviewData={isPreviewData} />
            <Research_Edit_Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} refresh={fetchingApi} />

        </>
    )
}

export default Research