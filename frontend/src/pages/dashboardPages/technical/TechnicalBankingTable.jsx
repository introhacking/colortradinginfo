import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { apiService } from '../../../services/apiService';
import Button from '../../../components/componentLists/Button';
import * as BiIcons from 'react-icons/bi';
import * as RiIcons from 'react-icons/ri';
import Loading from '../../../Loading';
import DeleteTechBankModal from '../../../components/dashboardPageModal/alertModal/DeleteTechBankModal';
import AlertModal from '../../../components/dashboardPageModal/alertModal/AlertModal';
import Technical_Banking_Info_Modal from '../../../components/dashboardPageModal/technicalModal/Technical_Banking_Info_Modal';
import Technical_Banking_Edit_Modal from '../../../components/dashboardPageModal/technicalModal/Technical_Banking_Edit_Modal';

const TechnicalBankingTable = () => {
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [selectedTableOption, setSelectedTableOption] = useState('technical-banking_sale_growth');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [noDataFoundMsg, setNoDataFoundMsg] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})


    // DELETING HANDLING
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState({});

    // TABLE DELETING  
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [selectedTableToDeletedByLabel, setSelectedTableToDeletedByLabel] = useState('Sale growth');


    const options = [
        { value: '', label: '--Choose table--' },
        { value: 'technical-banking_sale_growth', label: 'Sale growth' },
        { value: 'technical-banking_opg', label: 'Operating profit growth' },
        { value: 'technical-banking_npg', label: 'Net profit growth' },
    ];

    const handleSelectChange = (e) => {
        const { value } = e.target;
        setSelectedTableOption(value);

        const selectedOption = options.find(option => option.value === value);
        if (selectedOption) {
            setSelectedTableToDeletedByLabel(selectedOption.label);
        }
    };

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)

    }

    const deleteConfirmationModal = (paramData) => {
        const deletingPath = selectedTableOption
        setIsDeletingId({ ...paramData, deletingPath })
        setIsDeleteModalOpen(true)
    }


    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        setNoDataFoundMsg('');
        try {
            const response = await apiService.getInfoFromServer(`/${selectedTableOption}`);
            const data = response;
            if (data.length > 0) {
                const cols = Object.keys(data[0]).map(key => ({
                    headerName: key,
                    field: key,
                    sortable: true,
                    filter: true,
                    maxWidth: 140,
                    cellStyle: { textAlign: 'center' }
                }));

                const customColHeader = {
                    headerName: "Action",
                    field: 'action',
                    maxWidth: 140,
                    pinned: 'left',
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

                cols.unshift(customColHeader);
                setColumnDefs(cols);
                setRowData(data);
            } else {
                setNoDataFoundMsg('No data found for the selected option.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedTableOption]);

    const defaultColDef = useMemo(() => ({
        sortable: true,
    }), []);

    return (
        <>
            <div className='flex justify-between flex-col gap-3'>
                <div className='flex justify-between gap-2 items-center'>
                    <Button
                        onClick={() => setIsAlertModalOpen(true)}
                        children='Delete All Table Data'
                        className={`${rowData.length > 0 ? "button button_cancel" : "bg-red-200/40 button cursor-not-allowed"}`}
                        disabled={rowData.length === 0}
                    />
                    <Button
                        children={
                            <select className='py-1 px-3' value={selectedTableOption} onChange={handleSelectChange}>
                                {options.map((option, idx) => (
                                    <option key={option.value} value={option.value} disabled={idx === 0}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        }
                        className={`${rowData.length > 0 && "font-medium"}`}
                    />
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        children='Add Technical Banking Info'
                        className='button hover:bg-green-400 bg-green-500 text-white'
                    />
                </div>

                {isLoading && <Loading msg='Loading... please wait' />}
                {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
                {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded text-center inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}

                {!isLoading && !error && !noDataFoundMsg && (
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
            </div>
            <DeleteTechBankModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} />
            <AlertModal isOpen={isAlertModalOpen} onClose={() => setIsAlertModalOpen(false)} deletingRoute={selectedTableOption} tableName={selectedTableToDeletedByLabel} callFunction={fetchData} />
            <Technical_Banking_Info_Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <Technical_Banking_Edit_Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} />
        </>
    );
};

export default TechnicalBankingTable;
