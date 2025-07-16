import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { apiService } from '../../../services/apiService';
import Button from '../../../components/componentLists/Button';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import Loading from '../../../Loading';
import FromURL_Info_Modal2 from '../../../components/dashboardPageModal/fromURLModal2/FromURL_Info_Modal2';
// import Delivery_Info_Modal from '../../../components/dashboardPageModal/deliveryModal/Delivery_Info_Modal';
// import DeleteModal from '../../../components/dashboardPageModal/alertModal/DeleteModal';
// import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
// import FromURL_Info_Modal from '../../../components/dashboardPageModal/fromURLModal/FromURL_Info_Modal';
// import FromURL_Edit_Form from '../../../components/dashboardPageModal/fromURLModal/FromURL_Edit_Form';
// import Delivery_Edit_Form from '../../../components/dashboardPageModal/deliveryModal/Delivery_Edit_Form';

const FromURLTable2 = () => {
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');

    const [fileList, setFileList] = useState([]);
    const [selectedFile, setSelectedFile] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeTab, setActiveTab] = useState('latest');

    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});


    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    // TABLE DELETING  
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    // const [selectedTableToDeletedByLabel, setSelectedTableToDeletedByLabel] = useState('Sale growth');

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = 'delivery'
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }

    // const fetchFileListsData = async (fileName) => {
    //     setIsLoading(true);
    //     setError('');
    //     setNoDataFoundMsg('');

    //     try {
    //         const serverResponse = await apiService.getInfoFromServer(`/csv/read-csv-data?file=${fileName}`);
    //         const data = serverResponse;

    //         if (data.length > 0) {
    //             const keys = Object.keys(data[0]);

    //             const dynamicCols = keys.map((key) => ({
    //                 headerName: key.replace(/_/g, ' ').toUpperCase(),
    //                 field: key,
    //                 sortable: true,
    //                 filter: true,
    //                 maxWidth: 200,
    //                 cellClass: 'custom-cell-style',
    //             }));

    //             const actionColumn = {
    //                 headerName: "Action",
    //                 field: 'action',
    //                 pinned: 'left',
    //                 maxWidth: 140,
    //                 cellRenderer: (params) => (
    //                     <div className="flex justify-between">
    //                         <Button
    //                             onClick={() => updateBankInfo(params.data)}
    //                             children={<BiIcons.BiEdit className="text-2xl" />}
    //                             className="button ag_table_edit_button"
    //                             type="button"
    //                         />
    //                         <Button
    //                             children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
    //                             className="button button_cancel"
    //                             type="button"
    //                             onClick={() => {
    //                                 deleteConfirmationModal(params.data);
    //                             }}
    //                         />
    //                     </div>
    //                 ),
    //             };

    //             setColumnDefs([actionColumn, ...dynamicCols]);
    //             setRowData(data);
    //         } else {
    //             setNoDataFoundMsg('No data found for the selected option.');
    //         }
    //     } catch (err) {
    //         setError(err.message);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const customCellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px 0',
        width: '100px',
        height: "20px",
        marginTop: '7px',
        marginRight: 'auto',
        marginLeft: 'auto',
        color: 'white',

    }
    const getCellStyle = params => {
        if (params.value < 50) {
            return { backgroundColor: 'red', ...customCellStyle };
        }
        if (params.value <= 500) { return { backgroundColor: 'orange', ...customCellStyle } };
        if (params.value >= 500) { return { backgroundColor: 'green', ...customCellStyle } };

    };


    const fetchFileListsData = async (fileName) => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');

        try {
            const serverResponse = await apiService.getInfoFromServer(`/csv/read-csv-data?file=${fileName}`);
            const data = serverResponse;

            if (data.length > 0) {
                // Define desired order
                const preferredOrder = [
                    "SYMBOL",
                    " DELIV_QTY",
                    " DELIV_PER",
                    " TTL_TRD_QNTY",
                    " AVG_PRICE",
                    " CLOSE_PRICE",
                    " LAST_PRICE",
                    " SERIES",
                    " DATE1",
                    " PREV_CLOSE",
                    " OPEN_PRICE",
                    " HIGH_PRICE",
                    " LOW_PRICE",
                    " TURNOVER_LACS",
                    " NO_OF_TRADES"
                ];

                // Reorder data
                const reorderedData = data.map((item) => {
                    const reorderedItem = {};
                    preferredOrder.forEach((key) => {
                        if (item.hasOwnProperty(key)) {
                            reorderedItem[key] = item[key];
                        }
                    });

                    // Add any remaining keys that weren't in preferredOrder
                    Object.keys(item).forEach((key) => {
                        if (!reorderedItem.hasOwnProperty(key)) {
                            reorderedItem[key] = item[key];
                        }
                    });

                    return reorderedItem;
                });

                // Use reordered keys to build column definitions
                const keys = Object.keys(reorderedData[0]);
                const dynamicCols = keys.map((key) => ({
                    headerName: key.replace(/_/g, ' ').toUpperCase(),
                    field: key,
                    sortable: true,
                    filter: true,
                    maxWidth: 145,
                    // cellClass: 'custom-cell-style',
                    // cellStyle: params => getCellStyle(params)
                }));

                const actionColumn = {
                    headerName: "Action",
                    field: 'action',
                    pinned: 'left',
                    checkboxSelection: true,
                    headerCheckboxSelection: true,
                    maxWidth: 155,
                    cellRenderer: (params) => (
                        <div className="flex justify-between">
                            <Button
                                onClick={() => updateBankInfo(params.data)}
                                children={<BiIcons.BiEdit className="text-2xl" />}
                                className="button ag_table_edit_button"
                                type="button"
                            />
                            <Button
                                children={<RiIcons.RiDeleteBin3Line className="text-2xl" />}
                                className="button button_cancel"
                                type="button"
                                onClick={() => {
                                    deleteConfirmationModal(params.data);
                                }}
                            />
                        </div>
                    ),
                };

                // setColumnDefs([actionColumn, ...dynamicCols]);
                setColumnDefs([...dynamicCols]);
                setRowData(reorderedData);
            } else {
                setNoDataFoundMsg('No data found for the selected option.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchFileLists = async () => {
        try {
            const serverResponse = await apiService.getInfoFromServer('/csv-files')
            setFileList(serverResponse.files)

        } catch (err) {
            setError(err.message);
        }
    }


    useEffect(() => {
        fetchFileLists()
    }, []);

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);



    const [data, setData] = useState([]);
    const [oldData, setOldData] = useState([]);
    const [diffRow, setDiffRow] = useState([]);


    // Handle Tab Switch
    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    const exportDataFromUrl = async () => {
        try {
            const serverResponse = await apiService.getInfoFromServer('/export-data')
            // console.log(serverResponse)

        } catch (err) {

        }
    }


    return (
        <>
            <div className='flex justify-between flex-col gap-3'>
                <div className='flex justify-between gap-2 items-center'>
                    <div className='flex justify-between items-center gap-2'>
                        <Button
                            onClick={() => setIsAlertModalOpen(true)}
                            children='Delete All Table Data'
                            className={`${rowData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                            disabled={rowData.length === 0}
                        />
                        {/* Tab Buttons */}
                        {/* <div className="flex">
                            <Button
                                className={`px-3 py-1 font-semibold ${activeTab === 'latest' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                                    } rounded-l`}
                                onClick={() => switchTab('latest')}
                                children={'Latest Data'}
                            />
                            <Button
                                className={`px-3 py-1 font-semibold ${activeTab === 'diff' ? 'bg-blue-600 text-white' : 'bg-gray-300'
                                    } rounded-r`}
                                onClick={() => switchTab('diff')}
                                children={'Difference'}
                            />
                        </div> */}

                        <div>
                            <Button className="font-medium">
                                <input
                                    type="text"
                                    id="file-input"
                                    list="file-list"
                                    placeholder="-- Select file --"
                                    value={selectedFile}
                                    onChange={(e) => {
                                        setSelectedFile(e.target.value);
                                        fetchFileListsData(e.target.value);
                                    }}
                                />
                            </Button>

                            <datalist id="file-list">
                                {fileList?.map((file) => (
                                    <option key={file} value={file}>
                                        {file}
                                    </option>
                                ))}
                            </datalist>
                        </div>


                        {/* <Button
                            children={
                                <select className='py-1 px-3' onChange={(e) => {
                                    setSelectedFile(e.target.value);
                                    fetchFileListsData(e.target.value);
                                }}
                                    value={selectedFile} >
                                    <option value='' selected disabled>--Select file--</option>
                                    {
                                        fileList?.map((file) =>
                                            <option key={file} value={`${file}`}>{file}</option>
                                        )
                                    }
                                </select>
                            }
                            className={`font-medium`}
                        /> */}


                    </div>
                    <div className='flex gap-2'>
                        {/* <Button
                            onClick={exportDataFromUrl}
                            children='Scrabing Data ( Export )'
                            className='button button_video text-white'
                        /> */}
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            children='Get Data From URL'
                            className='button hover:bg-green-400 bg-green-500 text-white'
                        />
                    </div>
                </div>

                {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}
                {selectedFile === '' && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: Please Select file first</span></div>}
                {!isLoading && !error && !noDataFoundMsg && selectedFile && (
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

            </div >

            {/* <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={'/delivery_table'} tableName={'Delivery'} callFunction={fetchData} />
            <FromURL_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData}  fetchData={fetchData} /> */}
            < FromURL_Info_Modal2 isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} fetchFileLists={fetchFileLists} />

        </>
    );
};

export default FromURLTable2;
