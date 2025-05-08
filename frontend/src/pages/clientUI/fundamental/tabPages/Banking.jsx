import React, { useState, useEffect, useMemo, Children } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../../services/bankingService';
import Bank_Cell_Info from '../../../../components/dashboardPageModal/bankingModal/Bank_Cell_Info';
import { toast } from 'sonner';
import Loading from '../../../../Loading';


const Banking = () => {
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [getBankDataDetails, setGetBankDataDetails] = useState([])

    // ERROR HANDLING
    const [errorMsg, setErrorMsg] = useState('')
    const [errorMsgStatus, setErrorMsgStatus] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const customCellStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        width: '60px',
        height: "10px",
        marginTop: '10px',
        marginRight: 'auto',
        marginLeft: 'auto',
        color: 'white',
    }

    const onCellClickedData = async (cellData) => {
        const customModified = {
            id: cellData.data._id,
            bankName: cellData.colDef.field,
            managementName: cellData.data.management_name
        };
        const bankDescription = await bankingService.getParamsData('q', customModified.bankName, customModified.managementName)
        const convertToStringy = JSON.stringify(bankDescription.description)
        setModalData(convertToStringy);
        setIsModalOpen(true);
    };

    const bankDetails = async () => {
        try {

            // Create unique bank names for columns
            const bankNames = [...new Set(getBankDataDetails.map(item => item.bank_name))];

            const allManagementTypes = getBankDataDetails.map(item => item.management_types).flat();
            // Use an object to remove duplicates by management_name
            const uniqueManagementTypes = {};
            allManagementTypes.forEach(item => {
                if (!uniqueManagementTypes[item.management_name]) {
                    uniqueManagementTypes[item.management_name] = item.description;
                }
            });
            // Convert the object back to an array format
            const combinedArray = Object.keys(uniqueManagementTypes).map(key => ({
                management_name: key,
                descriptions: uniqueManagementTypes[key]
            }));

            // Assuming setRowData is a function you use to set state or update some data
            setRowData(combinedArray);

            const bankColumns = bankNames.map(bank => ({
                // headerName: 'Bank Name',
                children: [
                    {
                        headerName: bank,
                        field: bank.replace(/[^a-zA-Z0-9]/g, ' '), // Remove non-alphanumeric characters for field names
                        sortable: true,
                        filter: true,
                        enableRowGroup: false,
                        maxWidth: 180,
                        cellRenderer: params => {
                            const bankData = getBankDataDetails.find(item => item.bank_name === params.colDef.headerName);
                            const management = bankData?.management_types?.find(management => management.management_name === params.data.management_name);
                            return (
                                <div className='w-full h-[40px] text-white text-center cursor-pointer' style={{ backgroundColor: management?.bgColor, ...customCellStyle }}>
                                    {/* {management?.management_name} */}
                                </div>
                            );
                        }
                    }
                ]
            }));

            // Define column definitions
            const generatedColumnDefs = [
                {
                    headerName: 'Paramaters',
                    field: 'management_name',
                    sortable: true,
                    filter: true,
                    maxWidth: 250,
                    pinned: 'left',
                    cellStyle: { cursor: 'not-allowed' },
                },
                ...bankColumns
            ];

            setColumnDefs(generatedColumnDefs);
        } catch (err) {
            toast.error(err);
        }
    };

    const fetchingApi = async () => {
        setIsLoading(true)
        try {
            const getBankData = await bankingService.getInfoFromServer('/banking');
            setGetBankDataDetails(getBankData)
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

    useEffect(() => {
        if (getBankDataDetails.length > 0) {
            bankDetails();
        }
    }, [getBankDataDetails]);

    if (isLoading) { return <div><Loading msg={'Loading... please wait'} /></div> }
    if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }
    return (
        <>
            <div className='ag-theme-alpine shadow w-full h-[80vh] overflow-y-auto'>
                <AgGridReact
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    onCellClicked={onCellClickedData}
                    groupDisplayType='groupRows'
                    animateRows={true}
                    pagination={true}
                    paginationPageSize={100}
                />
                <Bank_Cell_Info isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} />

            </div>
        </>
    )
}

export default Banking