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

const Research = () => {
    const [rowData, setRowData] = useState([{}]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLive, setLiveError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

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

    const [columnDefs] = useState([
        {
            headerName: "Action", field: 'action', flex: 1, maxWidth: 140,
            cellRenderer: (params) => {
                return (
                    <div className="flex justify-between">
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
        },
        {
            headerName: "Stock Name", field: 'stock_name'
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
            console.log(err)
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
                <div className='flex justify-end'>
                    <Button onClick={() => setIsModalOpen(true)} children={'Add Research Details'} className={'button hover:bg-green-400 bg-green-500 text-white '} />
                </div>
                {isLoading && <Loading msg='Loading... please wait' />}
                {errorLive && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorLive}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
                {!isLoading && !errorLive && !noDataFoundMsg && (
                    <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                        <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
                    </div>
                )}
            </div>
            <Research_Add_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}

export default Research