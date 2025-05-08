import React, { useEffect, useMemo, useState } from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Add_Content_Related_Row_Column from '../../../components/dashboardPageModal/Add_Content_Related_Row_Column';
// import { Toaster } from 'sonner'
import { bankingService } from '../../../services/bankingService.js'


const AgTable = () => {
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    // const savedRows = localStorage.getItem('rows');
    // const savedColumns = localStorage.getItem('columns');
    // const savedColor = localStorage.getItem('color');
    const savedTableData = localStorage.getItem('tableData');
    // console.log(savedTableData)

    const getTableDataFromServer = async () => {
      try {
        await bankingService.getInfoFromServer('/itCreate')
      } catch (err) {
        console.log(err)

      }
    }
    getTableDataFromServer()


    if (savedTableData) {
      const parsedTableData = JSON.parse(savedTableData);

      // Flatten the nested arrays into a single array
      const flattenedData = parsedTableData.flat();

      // Transform the row_column data into separate fields
      const transformedData = flattenedData.map(item => ({
        ...item,
        row_column_0: item.row_column[0],
        row_column_1: item.row_column[1]
      }));

      setRowData(transformedData);
    }



  }, [])

  const [updateModalStatus, setUpdateModalStatus] = useState(false)
  const [updateModalData, setUpdateModalData] = useState([])

  const updateBackgroundColor = (consoleData) => {
    setUpdateModalStatus(prev => !prev)
    setUpdateModalData(consoleData)
    // console.log(consoleData)
  }

  const [columnDefs] = useState([
    {
      headerName: "Action", field: 'action', flex: 1, maxWidth: 120,
      // checkboxSelection: true,
      cellRenderer: (params) => {
        return (
          <div className="flex justify-between">
            <div
              // onClick={() => onCheckingModal(params.data)}
              onClick={() => updateBackgroundColor(params.data)}
              className="ag_table_edit text-sm my-1  py-1 px-2 mr-1 text-center text-blue-600 tracking-wider cursor-pointer rounded"
            >
              {/* <BiIcons.BiEdit className="text-2xl" /> */}
              Edit
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
    // {
    //   headerName: "Rows & Column", field: 'row_column', flex: 1,

    //   cellStyle: params => {
    //     return {
    //       fontSize: '18px',
    //       textAlign: 'center'
    //     }
    //   }
    // },
    {
      headerName: "No. of Rows", field: 'row_column_0', flex: 1, cellStyle: params => {
        return {
          fontSize: '18px',
          textAlign: 'center'
        }
      }
    },
    {
      headerName: "No. of Column", field: 'row_column_1', flex: 1, cellStyle: params => {
        return {
          fontSize: '18px',
          textAlign: 'center'
        }
      }
    },
    {
      headerName: "Post Title", field: 'postTitle', flex: 1, cellStyle: params => {
        return {
          // backgroundColor: params.data.backgroundColor,
          // color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }
      }
    },
    {
      headerName: "Cell Name", field: 'cellTitle', flex: 1, cellStyle: params => {
        return {
          fontSize: '18px',
          textAlign: 'center'
        }
      }
    },
    {
      headerName: "Colour", field: 'backgroundColor', filter: true, flex: 1, cellStyle: params => {
        return {
          backgroundColor: params.data.backgroundColor,
          color: 'white',
          fontSize: '18px',
          textAlign: 'center'
        }
      }
    },
  ]);
  const defaultColDef = useMemo(() => ({
    sortable: true
  }), []);

  // const onGridReady = useCallback(() => {
  //   fetch('/api/v1/paan/products')
  //     .then(result => result.json())
  //     .then(rowData => setRowData(rowData.result))
  // }, [rowData]);

  // onGridReady={onGridReady}


  return (
    <>
      <div className='ag-theme-alpine shadow w-full h-[70vh] overflow-y-auto'>
        <AgGridReact rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
        {/* <Toaster richColors position="top-right" /> */}
      </div>
      {updateModalStatus && <div>
        <Add_Content_Related_Row_Column updateModalData={updateModalData} setUpdateModalStatus={setUpdateModalStatus} />
      </div>

      }
    </>
  )
}

export default AgTable