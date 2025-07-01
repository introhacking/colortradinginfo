import React, { useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Button from '../../../components/componentLists/Button'
import { bankingService } from '../../../services/bankingService';
import Loading from '../../../Loading';


const LiveExcelSheet = () => {
    const [sheetData, setSheetData] = useState({});
    const [activeSheet, setActiveSheet] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const [excelUrl, setExcelUrl] = useState({ url: '' })
    const fetchExcelData = async () => {
        setIsLoading(true);
        try {

            const serverResponse = await bankingService.postFormInfoToServer('connect-to-excel', { excelUrl })
            // console.log(serverResponse)
            const sheets = serverResponse.sheets || {};
            setSheetData(sheets);
            const firstSheetKey = Object.keys(sheets)[0];
            setActiveSheet(firstSheetKey);

        } catch (err) {

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            <div className="rounded-lg w-full mb-1">
                <div className='flex gap-3'>
                    <input type="text"
                        value={excelUrl.url}
                        onChange={(e) => setExcelUrl({ url: e.target.value })}
                        placeholder="Enter Excel URL"
                        name='url'
                        // disabled={`${excelUrl.url}`}
                        className="border p-1 border-gray-300 rounded w-4/5" />
                    <Button disabled={!excelUrl.url} onClick={fetchExcelData} children={'Connect'} className={`${!excelUrl.url ? 'cursor-not-allowed button button_ac opacity-45' : 'button button_ac'}`} />

                </div>
            </div>
            {isLoading && <Loading msg='Loading... please wait' />}
            {/* Sheet Tabs */}
            {!isLoading && (
                <div style={{ marginBottom: 15 }}>
                    {Object.keys(sheetData).map(sheetKey => (
                        <button
                            key={sheetKey}
                            onClick={() => setActiveSheet(sheetKey)}
                            style={{
                                marginBottom: 5,
                                padding: '4px 8px',
                                backgroundColor: sheetKey === activeSheet ? '#007bff' : '#f0f0f0',
                                color: sheetKey === activeSheet ? '#fff' : '#000',
                                border: 'none',
                                borderRadius: 4,
                                cursor: 'pointer'
                            }}
                        >
                            {sheetKey}
                        </button>
                    ))}
                    {/* AG Grid Table */}
                    {activeSheet && sheetData[activeSheet] && (
                        <div className='ag-theme-alpine overflow-y-auto h-[57vh] w-full'>
                            <AgGridReact
                                rowData={sheetData[activeSheet].data}
                                columnDefs={sheetData[activeSheet].columns}
                                defaultColDef={{
                                    resizable: true,
                                    sortable: true,
                                    filter: true,
                                }}
                                animateRows={true}
                                pagination={true}
                                rowSelection="multiple"
                                paginationPageSize={100}
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default LiveExcelSheet