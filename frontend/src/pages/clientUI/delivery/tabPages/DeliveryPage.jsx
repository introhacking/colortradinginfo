import React, { useState, useEffect, useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toast } from 'sonner';
import Loading from '../../../../Loading';
import { bankingService } from '../../../../services/bankingService';

const DeliveryPage = () => {

  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

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
    border: '1px solid red',
    backgroundColor:'red'
  }
  const defaultColDef = useMemo(() => ({
    sortable: true,
  }), []);
  const fetchApiData = async () => {
    setIsLoading(true)
    try {
      const serverResponse = await bankingService.getInfoFromServer('/delivery')
      const maxVolumnDeliveryLength = Math.max(...serverResponse.map(stock => stock.volumnDeliveryData.length));
      const dynamicCols = [];
      for (let i = 0; i < maxVolumnDeliveryLength; i += 2) {
        const volIndex = (i / 2) + 1;
        dynamicCols.push(
          {
            headerName: `Volume V${volIndex}`,
            field: `vol_v${volIndex}`,
            sortable: true,
            filter: 'agNumberColumnFilter',
            // cellClass: 'custom-cell-style , custom-cell-style-color-v',
            cellClass: 'custom-cell-style',
            maxWidth: 250,
            valueGetter: (params) => {
              const volValue = params.data.volumnDeliveryData[i];
              return volValue !== undefined ? `${volValue}` : 0;
            }
          },
          {
            headerName: `Del % D${volIndex}`,
            field: `del_d${volIndex}`,
            sortable: true,
            filter: 'agNumberColumnFilter',
            // cellClass: 'custom-cell-style , custom-cell-style-color-d',
            cellClass: 'custom-cell-style',
            maxWidth: 250,
            valueGetter: (params) => {
              const delValue = params.data.volumnDeliveryData[i + 1];
              return delValue !== undefined ? `${delValue}` : 0;
            }
          }


        //   {
        //   headerName: `Volume V${volIndex} , Del % D${volIndex}`,
        //   field: `vol_v${volIndex} & del_d${volIndex}`,
        //   sortable: true,
        //   filter: true,
        //   cellClass: customCellStyle,
        //   maxWidth: 250,
        //   valueGetter: (params) => {
        //     const volValue = params.data.volumnDeliveryData[i];
        //     const delValue = params.data.volumnDeliveryData[i + 1];
        //     return volValue !== undefined || delValue !== undefined ? `${volValue} , ${delValue}` : '';
        //   }
        // }
      );
      }
      const cols = [
        { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 150 , pinned:'left' },
        ...dynamicCols
      ];

      setColumnDefs(cols);
      setErrorMsgStatus(false)
      setRowData(serverResponse)
      setIsLoading(false)
    } catch (err) {
      setErrorMsgStatus(true)
      setErrorMsg(err.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApiData()
  }, [])

  if (isLoading) { return <div><Loading msg={'Loading... please wait'} /></div> }
  if (errorMsgStatus) { return <div className='bg-red-100 px-4 py-1 inline-block rounded'><span className='font-medium text-red-500 inline-block'>Error: {errorMsg}</span></div> }

  return (
    <>
      <div className='ag-theme-alpine shadow w-full h-[80vh] overflow-y-auto'>
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          // onCellClicked={onCellClickedData}
          // groupDisplayType='groupRows'
          animateRows={true}
          pagination={true}
          paginationPageSize={100}
          />
        {/* <Bank_Cell_Info isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} data={modalData} /> */}
      </div>
    </>
  )
}

export default DeliveryPage


  //const parseRawData = (data) => {
  // console.log(data)
  // const lines = data[0].data.trim().split('\n');
  // console.log(lines)


  // return data[0].data.map(line => {
  //   const [stockName, ...values] = line.split(',');
  //   const structuredData = { stockName };

  //   for (let i = 0; i < values.length; i += 2) {
  //     const volKey = `vol_v${(i / 2) + 1}`;
  //     const delKey = `del_d${(i / 2) + 1}`;
  //     structuredData[volKey] = parseFloat(values[i]);
  //     structuredData[delKey] = parseFloat(values[i + 1]);
  //   }

  //   return structuredData;
  // });


  //};
  // useEffect(() => {
  // const transformedData = stockData.map(stock => (
  //   console.log(stock)
  // stockName: stock.stockName,
  // 'vol_v1 & del_d1': `${stock.vol_v1} , ${stock.del_d1}`,
  // 'vol_v2 & del_d2': `${stock.vol_v2} , ${stock.del_d2}`
  // ));

  // const transformedData = parseRawData(stockData)    

  //   const results = [];
  //   stockData[0].data.map((stock) => {
  //     const lines = stock.trim().split('\n');
  //     return lines.map(line => {
  //       const [stockName, ...values] = line.split(',');
  //       console.log(stockName, values)
  //       const structuredData = { stockName };
  //       for (let i = 0; i < values.length; i += 2) {

  //         const combinedKey = `vol_v${(i / 2) + 1} & del_d${(i / 2) + 1}`;
  //         structuredData[combinedKey] = `${parseFloat(values[i])}, ${parseFloat(values[i + 1])}`;
  //         // const volKey = `vol_v${(i / 2) + 1}`;
  //         // const delKey = `del_d${(i / 2) + 1}`;
  //         // structuredData[volKey] = parseFloat(values[i]);
  //         // structuredData[delKey] = parseFloat(values[i + 1]);
  //       }
  //       results.push(structuredData)
  //       return results;
  //     })
  //   });
  //   console.log(results)
  //   setRowData(results);
  //   const cols = [
  //     { headerName: 'Stock Name', field: 'stockName', sortable: true, filter: true, maxWidth: 150 },
  //     { headerName: 'Volume V1 , Del % D1', field: 'vol_v1 & del_d1', sortable: true, filter: true, maxWidth: 250 },
  //     { headerName: 'Volume V2 , Del % D2', field: 'vol_v2 & del_d2', sortable: true, filter: true, maxWidth: 250 },
  //     { headerName: 'Volume V3 , Del % D3', field: 'vol_v3 & del_d3', sortable: true, filter: true, maxWidth: 250 },
  //     { headerName: 'Volume V4 , Del % D4', field: 'vol_v4 & del_d4', sortable: true, filter: true, maxWidth: 250 },
  //     { headerName: 'Volume V5 , Del % D5', field: 'vol_v5 & del_d5', sortable: true, filter: true, maxWidth: 250 }
  //   ];
  //   setColumnDefs(cols);
  // }, []);