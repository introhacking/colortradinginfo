import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../../../Loading';
import { bankingService } from '../../../services/bankingService';
import { AgGridReact } from 'ag-grid-react';
import Button from '../../../components/componentLists/Button';
const MasterScreen = () => {
  const gridRef = useRef();
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [noDataFoundMsg, setNoDataFoundMsg] = useState('');


  const customCellStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 0',
    // width: '80px',
    height: "20px",
    marginTop: '7px',
    marginRight: 'auto',
    marginLeft: '10px',
    color: 'white',
    textAlign: 'center'
  }

  function getCellStyle(params) {
    const value = params.value;
    // Handle string '-' or empty
    if (value === '-' || value === '' || value == null) {
      return { backgroundColor: 'black', fontStyle: 'italic', ...customCellStyle }; // style for missing data
    }
    const numValue = Number(value);
    if (numValue <= -1) return { backgroundColor: 'red', ...customCellStyle };
    if (numValue === 0) return { backgroundColor: '#9056a9', ...customCellStyle };
    if (numValue === 1) return { backgroundColor: 'lightblue', ...customCellStyle };
    if (numValue === 2) return { backgroundColor: 'gray', ...customCellStyle };
    if (numValue === 3) return { backgroundColor: 'orange', ...customCellStyle };
    if (numValue === 4) return { backgroundColor: 'lightgreen', ...customCellStyle };
    if (numValue >= 5) return { backgroundColor: 'green', ...customCellStyle };

    return null; // no style
  }

  const getCapMergeFile = async () => {
    setIsLoading(true);
    setError('');
    setNoDataFoundMsg('');
    try {
      const serverResponse = await bankingService.getInfoFromServer('/master-screen')
      setRowData(serverResponse);
      console.log(serverResponse)

      const today = new Date();
      const currentMonth = today.toLocaleString('en-US', { month: 'short' }); // e.g., 'Jun'
      const currentYear = String(today.getFullYear()).slice(2);              // e.g., '25'
      const currentHeader = `${currentMonth}${currentYear}`;

      const dynamicColumns = Object.keys(serverResponse[0])
        .sort((a, b) => {
          // Always keep 'stockName' first
          if (a === 'stockName') return -1;
          if (b === 'stockName') return 1;

          // Put current month first
          if (a === currentHeader) return -1;
          if (b === currentHeader) return 1;

          // Parse month and year to compare
          const parse = (val) => {
            const monthAbbr = val.slice(0, 3);
            const year = parseInt(val.slice(3), 10);
            const month = new Date(`${monthAbbr} 1, 2000`).getMonth(); // Get month index
            return year * 12 + month;
          };

          return parse(b) - parse(a); // Descending order
        })
        .map(key => ({
          headerName: key,
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
          cellRenderer: (params) => {
            return (params.value === null || params.value === undefined) ? '-' : params.value;
          },
          cellStyle: params => getCellStyle(params),
        }));
      setColumnDefs([...dynamicColumns]);


    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const defaultColDef = useMemo(() => ({
    sortable: true
  }), []);

  const handleExportToExcel = () => {
    try {
      const allVisibleColumns = gridRef.current.columnApi.getAllDisplayedColumns();
      const columnKeys = allVisibleColumns.map(col => col.getColId());
      gridRef.current.api.exportDataAsCsv({
        fileName: 'AllCapCSVData.csv',
        columnKeys: columnKeys,
      });
    } catch (err) {
      console.log(err)

    }
  };

  useEffect(() => {
    getCapMergeFile()
  }, [])


  return (
    <div>
      <div className='flex justify-end mb-2 gap-2'>
        <Button onClick={handleExportToExcel} children={'Export to CSV'} className={`${rowData.length > 0 ?  'button hover:bg-green-400 bg-green-500 text-white' : 'button bg-green-400 text-white hover:bg-green-400 cursor-not-allowed'}  `} />
      </div>
      {isLoading && <Loading msg='Loading... please wait' />}
      {error && <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {error}</span></div>}
      {noDataFoundMsg && <div className='bg-gray-100 px-4 py-1 rounded inline-block my-4'><span className='font-medium text-gray-400'>Message: {noDataFoundMsg}</span></div>}

      {!isLoading && !error && !noDataFoundMsg && (
        <div className='ag-theme-alpine overflow-y-auto h-[70vh] w-full'>
          < AgGridReact ref={gridRef} rowData={rowData} columnDefs={columnDefs} defaultColDef={defaultColDef} animateRows={true} pagination={true} paginationPageSize={100} />
        </div>
      )}
    </div>
  )
}

export default MasterScreen