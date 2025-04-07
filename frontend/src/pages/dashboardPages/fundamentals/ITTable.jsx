import React, { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { bankingService } from '../../../services/bankingService';
import Button from '../../../components/componentLists/Button';
import IT_Info_Form from '../../../components/dashboardPageModal/itModal/IT_Info_Form';
import IT_Edit_Form from '../../../components/dashboardPageModal/itModal/IT_Edit_Form';
import * as BiIcons from 'react-icons/bi'
// import * as RiIcons from 'react-icons/ri'
const ITTable = () => {
    const [rowData, setRowData] = useState([{

    }]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isParamsData, setIsParamsData] = useState({})

    const updateBankInfo = (paramData) => {
        setIsParamsData(paramData)
        setIsEditModalOpen(true)
    }

    const [columnDefs] = useState([
        {
            headerName: "Action", field: 'action', flex: 1, maxWidth: 120,
            // checkboxSelection: true,
            cellRenderer: (params) => {
                return (
                    <div className="flex justify-between">
                        <div
                            onClick={() => updateBankInfo(params.data)}
                            className="py-1 px-2 text-sm text-center cursor-pointer rounded"
                        >
                            {/* <BiIcons.BiEdit className="text-2xl" /> */}
                            <Button children={<BiIcons.BiEdit className="text-2xl"/>} className={'button ag_table_edit_button'} type={'button'}/>
                        </div>
                        <div
                            // onClick={() => {
                            //   deleteOperation(params.data.prod_ID);
                            // }}
                            className="ag_table_delete py-1 my-1 px-2 text-sm text-center text-white tracking-wider cursor-pointer rounded"
                        >
                            {/* <RiIcons.RiDeleteBin3Line className="text-2xl" /> */}
                        </div>
                    </div>
                );
            },
        },
        {
            headerName: "IT Name", field: 'it_name'
        },
    ]);
    const defaultColDef = useMemo(() => ({
        sortable: true
    }), []);
    const fetchingApi = async () => {
        try {
            const getBankData = await bankingService.getInfoFromServer('/itCreate');
            setRowData(getBankData)
            // setRowData(transformedData);

        } catch (err) {
            console.log(err)
        }

    }
    useEffect(() => {
        fetchingApi();
    }, [])
    return (
        <>
            <div className='flex justify-between flex-col gap-3 '>
                {/* <div>
                    IT Page
                </div> */}
                <div className='flex justify-end'>
                    <Button onClick={() => setIsModalOpen(true)} children={'Add IT Info'} className={'button hover:bg-green-400 bg-green-500 text-white '} />
                    {/* <button onClick={() => setIsModalOpen(true)} className='px-2 py-1 hover:bg-green-400 bg-green-500 font-medium rounded text-white'>Bank form</button> */}
                </div>
                <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
                    <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
                </div>
            </div>

            <IT_Info_Form isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <IT_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} />
            {/* <Bank_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} /> */}

            {/* {createModalStatus && <div>
      <Add_Column_Row_Modal createTableModal={createTableModal} />
    </div>
    } */}



        </>
    );
};

export default ITTable;
