import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Loading from '../../../Loading';
import { apiService } from '../../../services/apiService';
import { AgGridReact } from 'ag-grid-react';
import Button from '../../../components/componentLists/Button';
import Custom_AGFilter from '../../clientUI/daily_IO/Custom_AGFilter';
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
    width: '80px',
    height: "20px",
    marginTop: '7px',
    marginRight: 'auto',
    marginLeft: '40px',
    color: 'white',
    textAlign: 'center'
  }

  const customCellStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '13px 0',
    height: "20px",
    width: '180px',
    marginTop: '7px',
    marginRight: 'auto',
    marginLeft: '15px',
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
  const getCellStyless = (params) => {
    const value = params.value;

    if (value === '-' || value === '' || value == null) {
      return {
        backgroundColor: 'black',
        color: 'white',
        fontStyle: 'italic',
        ...customCellStyle
      };
    }

    // Extract % value from format like: "874563 / -72.24%"
    const percentMatch = value.match(/([-+]?[0-9]*\.?[0-9]+)%/);
    const percentValue = percentMatch ? parseFloat(percentMatch[1]) : null;

    if (percentValue === null || isNaN(percentValue)) {
      return {
        backgroundColor: 'black',
        color: 'white',
        fontStyle: 'italic',
        ...customCellStyles
      };
    }

    // ✅ Style conditions
    if (percentValue > 80) {
      return {
        backgroundColor: 'green',
        color: 'white',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    if (percentValue > 50) {
      return {
        backgroundColor: 'lightgreen',
        color: 'black',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    if (percentValue >= 0) {
      return {
        backgroundColor: 'orange',
        color: 'black',
        ...customCellStyles
      };
    }

    if (percentValue < 0) {
      return {
        backgroundColor: 'red',
        color: 'white',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    return null; // default style
  };

  const getCellStyles = (params) => {
    const value = params.value;

    // ✅ Handle empty/null/invalid values
    if (value === null || value === undefined || value === '' || isNaN(value)) {
      return {
        backgroundColor: 'black',
        color: 'white',
        fontStyle: 'italic',
        ...customCellStyles
      };
    }

    const percentValue = typeof value === 'number' ? value : parseFloat(value);

    // 🎯 Conditional coloring
    if (percentValue > 80) {
      return {
        backgroundColor: 'green',
        color: 'white',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    if (percentValue > 50) {
      return {
        backgroundColor: 'lightgreen',
        color: 'black',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    if (percentValue >= 0) {
      return {
        backgroundColor: 'orange',
        color: 'black',
        ...customCellStyles
      };
    }

    if (percentValue < 0) {
      return {
        backgroundColor: 'red',
        color: 'white',
        fontWeight: 'bold',
        ...customCellStyles
      };
    }

    return null;
  };


  const getCapMergeFile_first = async () => {
    setIsLoading(true);
    setError('');
    setNoDataFoundMsg('');
    try {
      const serverResponse = await apiService.getInfoFromServer('/master-screen')
      console.log(serverResponse)
      setRowData(serverResponse);
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

          return parse(a) - parse(b); // Descending order
        })
        .map(key => ({
          headerName: key,
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
          maxWidth: 145,
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
  const getCapMergeFile = async () => {
    setIsLoading(true);
    setError('');
    setNoDataFoundMsg('');

    try {
      const serverResponse = await apiService.getInfoFromServer('/master-screen');

      const today = new Date();
      const currentMonth = today.toLocaleString('en-US', { month: 'short' });
      const currentYear = String(today.getFullYear()).slice(2);
      const currentKey = `${currentMonth}${currentYear}`;

      const getMonthValue = (key) => {
        if (!/^[A-Za-z]{3}\d{2}$/.test(key)) return -Infinity;
        const monthAbbr = key.slice(0, 3);
        const year = parseInt(key.slice(3), 10);
        const month = new Date(`${monthAbbr} 1, 2000`).getMonth();
        return year * 12 + month;
      };

      const normalizeSymbol = (str) =>
        str?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

      const rawStocks = serverResponse.stocks || [];

      // Step 1: Build pivot map from spurt data
      const pivotMap = {};
      const allDates = new Set();

      rawStocks.forEach(stock => {
        const symbol = normalizeSymbol(stock.stockName);
        const spurt = stock.spurt;
        const pivotRow = {};

        if (spurt && typeof spurt === 'object') {
          for (const [date, stats] of Object.entries(spurt)) {
            allDates.add(date);
            pivotRow[`deliv_${date}`] = `${stats.DELIV_QTY_avg} / ${stats.DELIV_QTY_percent}`;
            pivotRow[`ttd_${date}`] = `${stats.TTL_TRD_QNTY_avg} / ${stats.TTL_TRD_QNTY_percent}`;
          }
        }

        pivotMap[symbol] = pivotRow;
      });

      // Step 2: Merge spurt data into each stock row, remove `spurt` field to avoid React error
      const mergedRows = rawStocks.map(stock => {
        const symbol = normalizeSymbol(stock.stockName);
        const { spurt, ...rest } = stock; // REMOVE spurt object
        return {
          ...rest,
          ...pivotMap[symbol]
        };
      });

      // Step 3: Extract dynamic stock keys (months) and skip any object fields
      const sampleStock = rawStocks.find(s => typeof s === 'object') || {};
      const dynamicColumns = Object.keys(sampleStock)
        .filter(key => typeof sampleStock[key] !== 'object') // skip objects like `spurt`
        .sort((a, b) => {
          if (a.toLowerCase() === 'stockname') return -1;
          if (b.toLowerCase() === 'stockname') return 1;
          if (a === currentKey) return -1;
          if (b === currentKey) return 1;
          return getMonthValue(a) - getMonthValue(b);
        })
        .map(key => ({
          headerName: key.toUpperCase(),
          field: key,
          sortable: true,
          filter: true,
          pinned: true,
          resizable: true,
          maxWidth: 140,
          cellRenderer: (params) =>
            params.value === null || params.value === undefined ? '-' : params.value,
          cellStyle: getCellStyle
        }));

      // Step 4: Format grouped date columns (for spurt)
      const formatDateToHeader = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${day}-${monthNames[parseInt(month, 10) - 1]}-${year}`;
      };

      const dateColumns = Array.from(allDates).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('/').map(Number);
        const [dayB, monthB, yearB] = b.split('/').map(Number);
        return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
      }).map(date => ({
        headerName: `Date: ${formatDateToHeader(date)}`,
        marryChildren: true,
        headerClass: 'cs_ag-center-header',
        children: [
          {
            field: `deliv_${date}`,
            headerName: 'Deliv Avg / Deliv %',
            tooltipField: `deliv_${date}`,
            filter: 'agNumberColumnFilter',
            valueGetter: (params) => {
              const raw = params.data?.[`deliv_${date}`];

              if (typeof raw !== 'string') return null;

              const parts = raw.split('/');
              if (!parts[1]) return null;

              const percentStr = parts[1].trim().replace('%', '');
              const percent = parseFloat(percentStr);
              return isNaN(percent) ? null : percent;
            },
            valueFormatter: (params) => {
              const raw = params.data?.[`deliv_${date}`];
              return typeof raw === 'string' ? raw : '-';
            },
            cellStyle: getCellStyles
          },
          {
            field: `ttd_${date}`,
            headerName: 'TTD Avg / TTD %',
            tooltipField: `ttd_${date}`,
            filter: 'agNumberColumnFilter',
            valueGetter: (params) => {
              const raw = params.data?.[`deliv_${date}`];
              if (typeof raw !== 'string') return null;

              const parts = raw.split('/');
              if (!parts[1]) return null;

              const percentStr = parts[1].trim().replace('%', '');
              const percent = parseFloat(percentStr);
              return isNaN(percent) ? null : percent;
            },
            valueFormatter: (params) => {
              const raw = params.data?.[`deliv_${date}`];
              return typeof raw === 'string' ? raw : '-';
            },
            cellStyle: getCellStyles
          }
        ]
      }));

      // Step 5: Apply to grid
      setRowData(mergedRows);
      setColumnDefs([
        ...dynamicColumns,
        ...dateColumns
      ]);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


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
    <div className='w-full'>
      <div className='w-full flex justify-end mb-2 gap-2'>
        <Button onClick={handleExportToExcel} children={'Export to CSV'} className={`${rowData.length > 0 ? 'button hover:bg-green-400 bg-green-500 text-white' : 'button bg-green-400 text-white hover:bg-green-400 cursor-not-allowed'}  `} />
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