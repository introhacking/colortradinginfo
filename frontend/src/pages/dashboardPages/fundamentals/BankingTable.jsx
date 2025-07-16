import React, { useEffect, useMemo, useState } from 'react';
import AgTable from '../dashboardContent/AgTable';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { apiService } from '../../../services/apiService';
import Bank_Edit_Form from '../../../components/dashboardPageModal/bankingModal/Bank_Edit_Form';
import Button from '../../../components/componentLists/Button';
import Bank_Info_Form from '../../../components/dashboardPageModal/bankingModal/Bank_Info_Form';
import * as BiIcons from 'react-icons/bi'
import * as RiIcons from 'react-icons/ri'
import DeleteTechBankModal from '../../../components/dashboardPageModal/alertModal/DeleteTechBankModal';
const BankingTable = () => {
  const [rowData, setRowData] = useState([{

  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParamsData, setIsParamsData] = useState({})

  // DELETING HANDLING
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState({});

  const updateBankInfo = (paramData) => {
    // console.log(paramData)
    setIsParamsData(paramData)
    setIsEditModalOpen(true)
  }

  const deleteConfirmationModal = (paramData) => {
    const deletingPath = 'delivery'
    setIsDeletingId({ ...paramData, deletingPath })
    setIsDeleteModalOpen(true)
  }

  const [columnDefs] = useState([
    {
      headerName: "Action", field: 'action', flex: 1, maxWidth: 140,
      // checkboxSelection: true,
      cellRenderer: (params) => {
        return (
          <div className="flex justify-between">
            <div
              onClick={() => updateBankInfo(params.data)}
              className="py-1 px-2 text-sm text-center cursor-pointer rounded"
            >
              {/* <BiIcons.BiEdit className="text-2xl" /> */}
              <Button children={<BiIcons.BiEdit className="text-2xl" />} className={'button ag_table_edit_button'} type={'button'} />
            </div>
            <div
              onClick={() => {
                deleteConfirmationModal(params.data);
              }}
              className="py-1 px-2 text-sm text-center cursor-pointer rounded"
            >
              {/* <RiIcons.RiDeleteBin3Line className="text-2xl" /> */}
              
              {/* <Button children={<RiIcons.RiDeleteBin3Line className="text-2xl" />} className={'button button_cancel'} type={'button'} /> */}

            </div>
          </div>
        );
      },
    },
    {
      headerName: "Bank name", field: 'bank_name'
    },
  ]);
  const defaultColDef = useMemo(() => ({
    sortable: true
  }), []);
  const fetchingApi = async () => {
    try {
      const getBankData = await apiService.getInfoFromServer('/banking');
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
      <div className='flex justify-between flex-col gap-3'> {/* h-full */}
        {/* <div>
          Bank Page
        </div> */}
        <div className='flex justify-end'>
          <Button onClick={() => setIsModalOpen(true)} children={'Add Bank Info'} className={'button hover:bg-green-400 bg-green-500 text-white '} />
          {/* <button onClick={() => setIsModalOpen(true)} className='px-2 py-1 hover:bg-green-400 bg-green-500 font-medium rounded text-white'>Bank form</button> */}
        </div>
        <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
          <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
        </div>
      </div>

      <Bank_Info_Form isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Bank_Edit_Form isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} isParamsData={isParamsData} />
      <DeleteTechBankModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} isDeletingId={isDeletingId} />


      {/* {createModalStatus && <div>
      <Add_Column_Row_Modal createTableModal={createTableModal} />
    </div>
    } */}



    </>
  );
};

export default BankingTable;
