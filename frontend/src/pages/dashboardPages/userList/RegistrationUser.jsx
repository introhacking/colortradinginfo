import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as RiIcons from 'react-icons/ri';
import * as MdIcons from 'react-icons/md';
import { BACKEND_URI, apiService } from '../../../services/apiService';
import Loading from '../../../Loading';
import { toast } from 'sonner';
import UserDelete from './UserDelete';
import UserPermissionAccessPanelModal from './UserPermissionAccessPanelModal';

const RegistrationUser = () => {
    const [rowData, setRowData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorLive, setLiveError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

    // SCREEN ALLOWED PERMISSION 
    const [isAllowedScreenModalOpen, setIsAllowedScreenModalOpen] = useState(false);
    const [isAllowedScreenData, setIsAllowedScreenData] = useState({});
    const allowedScreenOperation = (paramData) => {
        setIsAllowedScreenData({ ...paramData })
        setIsAllowedScreenModalOpen(true)
    }

    const deleteOperation = (paramData) => {
        const deletingPath = 'user'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }

    const handleVerifyToggle = async (params) => {
        const userId = params.data._id;
        const newVerifyStatus = !params.data.verify;

        try {
            const serverResponse = await apiService.updatingById(`verify-user`, userId, { verify: newVerifyStatus });
            params.node.setData({
                ...params.data,
                verify: newVerifyStatus
            });
            toast.success(serverResponse.message); // ✅ now this works correctly

        } catch (err) {
            // console.error("Failed to update verify status", err);
            alert('Could not update user verification status.');
        }
    };


    const [columnDefs] = useState([
        {
            headerName: "Action", pinned: 'left', field: 'action', maxWidth: 150,
            cellRenderer: (params) => (
                <div className="flex justify-between">
                    <div onClick={() => deleteOperation(params.data)} className="ag_table_delete py-1 my-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded">
                        <RiIcons.RiDeleteBin3Line className="text-2xl" />
                    </div>
                    <div title='Screen Permission' onClick={() => allowedScreenOperation(params.data)} className="bg-sky-600 py-1 my-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded">
                        <MdIcons.MdOutlineScreenSearchDesktop className="text-2xl" />
                    </div>
                </div>
            )
        },
        {
            headerName: "Username", field: 'username', maxWidth: 160, filter: true
        },
        {
            headerName: "Role", field: 'role', maxWidth: 160, filter: true
        },
        {
            headerName: "Verify Status", field: 'verify', maxWidth: 160, filter: true,
            cellRenderer: (params) => {
                const isVerified = params.value;

                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isVerified}
                            onChange={() => handleVerifyToggle(params)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-300"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transform peer-checked:translate-x-full transition-transform duration-300"></div>
                    </label>
                );
            }
        },
        {
            headerName: "Created At", field: 'createdAt', filter: true
        },
        {
            headerName: "Last Updated At", field: 'updatedAt', filter: true
        },
    ]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        setLiveError('');
        setNoDataFoundMsg('');

        try {
            const serverResponse = await apiService.getInfoFromServer('/users');
            if (serverResponse.users?.length > 0) {
                setRowData(serverResponse.users);
            } else {
                setNoDataFoundMsg('No data found for the selected option.');
            }
        } catch (err) {
            setLiveError(err.message);
        } finally {
        }
        setIsLoading(false);
    };
    useEffect(() => {
        fetchInitialData(); // 👈 First call
    }, []); // runs only once on mount

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
                        paginationPageSize={100}
                    />
                </div>

            )}
            <UserDelete isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} refresh={fetchInitialData} />
            <UserPermissionAccessPanelModal isOpen={isAllowedScreenModalOpen} onClose={() => setIsAllowedScreenModalOpen(false)} userInfo={isAllowedScreenData} refresh={fetchInitialData} />
        </>
    )
}

export default RegistrationUser