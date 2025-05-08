import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';


const DynamicTable3 = () => {
const [rows, setRows] = useState(5);
const [columns, setColumns] = useState(6);
const [tableData, setTableData] = useState([]);

// Initialize table data
useEffect(() => {
//   const initialData = [];
//   for (let i = 0; i < rows; i++) {
//     const row = [];
//     for (let j = 0; j < columns; j++) {
//       row.push({ cellTitle: `R${i}C${j}`, backgroundColor: 'blue' });
//     }
//     initialData.push(row);
//   }
//   setTableData(initialData);
const savedTableData = localStorage.getItem('tableData');
setTableData(JSON.parse(savedTableData));
}, [rows, columns]);

// Create column definitions for AG Grid
const columnDefs = Array.from({ length: columns }, (_, index) => ( 
  { headerName: 'Stock Name', field:  `1234`},
  {
  headerName: `Column ${index + 1}`,
  field: `col${index}`,
  cellRenderer: params => (
    // console.log(params.data)
    <div
      className='flex items-center justify-center text-center text-white'
      style={{ backgroundColor: params.data[`col${index}`]?.backgroundColor }}
    >
      {params.data[`col${index}`]?.cellTitle}
    </div>
  )
}));

// Convert tableData to rowData for AG Grid
const rowData = tableData.map((row, rowIndex) => {
  const rowData = {};
  row.forEach((cell, colIndex) => {
    rowData[`col${colIndex}`] = cell;
  });
  return rowData;
});

return (
  <div className="ag-theme-alpine" style={{ height: 400, width: 600 }}>
    <AgGridReact
      columnDefs={columnDefs}
      rowData={rowData}
    />
  </div>
);
};

export default DynamicTable3