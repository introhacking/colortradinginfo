import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
// import IT_Info_Form from '../../../components/dashboardPageModal/itModal/IT_Info_Form';
// import IT_Edit_Form from '../../../components/dashboardPageModal/itModal/IT_Edit_Form';
import LargeCap_Info_Modal from '../../../components/dashboardPageModal/largeCapModal/LargeCap_Info_Modal';
// import { toast } from 'sonner';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import * as BiIcons from 'react-icons/bi'
import * as RiIcons from 'react-icons/ri'
import LargeCap_Edit_Modal from '../../../components/dashboardPageModal/largeCapModal/LargeCap_Edit_Modal';
import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';

const LargeCapTable = () => {
    const [rowData, setRowData] = useState([{

    }]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});
    const [isParamsData, setIsParamsData] = useState({})

    const updateBankInfo = (paramData) => {
         
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const deleteConfirmationModal = (paramData)=>{
        const deletingPath = 'large-cap'
        setIsDeletingId({...paramData, deletingPath})
        setIsDeleteModalOpen(true)
    }

    const [columnDefs] = useState([
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
                            {/* <BiIcons.BiEdit className="text-2xl" /> */}
                            {/* Edit */}
                            <Button children={<BiIcons.BiEdit className="text-2xl"/>} className={'button ag_table_edit_button'} type={'button'}/>
                        </div>
                        <div
                            onClick={() => {
                              deleteConfirmationModal(params.data);
                            }}
                            className="py-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded"
                        >
                            {/* <RiIcons.RiDeleteBin3Line className="text-2xl" /> */}
                            <Button children={<RiIcons.RiDeleteBin3Line className="text-2xl" />} className={'button button_cancel'} type={'button'}/>
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "Stock Name", field: 'stockName',filter: true ,flex: 1,maxWidth:350
        },
        {
            headerName: "Monthly Data", field: 'monthlyData',flex: 1
        },
    ]);
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);
    const fetchingApi = async () => {
        try {
            const getBankData = await bankingService.getInfoFromServer('/large-cap');
            setRowData(getBankData)
        } catch (err) {
            console.log(err)
        }
    }
    useEffect(() => {
        fetchingApi();
    }, [])
    return (
        <>
            <div className='flex justify-between flex-col gap-3'> {/* h-full */}
                {/* <div>
                    LargeCap Page
                </div> */}
                <div className='flex justify-between gap-2 items-center'>
                    <Button onClick={()=>setIsAlertModalOpen(true)} children={'Delete All Table Data'} className={`${rowData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"} `} disabled={rowData.length > 0 ? false : true} />
                    <Button onClick={() => setIsModalOpen(true)} children={'Add LargeCap Info'} className={'button hover:bg-green-400 bg-green-500 text-white '} />
                    {/* <button onClick={() => setIsModalOpen(true)} className='px-2 py-1 hover:bg-green-400 bg-green-500 font-medium rounded text-white'>Bank form</button> */}
                </div>
                <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                    <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
                </div>
            </div>

            <LargeCap_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={'large_cap'} />
            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} deletingPath={'large-cap'} />
            <LargeCap_Edit_Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} />
        </>
    );
};

export default LargeCapTable;
