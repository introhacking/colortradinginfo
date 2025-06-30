import React, { useState } from 'react'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Button from '../../../components/componentLists/Button'
import { bankingService } from '../../../services/bankingService';

const LiveExcelSheet = () => {
    const [excelUrl, setExcelUrl] = useState({
        url: ''
    })
    const fetchExcelData = async () => {
        try {

            const serverResponse = await bankingService.postFormInfoToServer('connect-to-excel', { excelUrl })
            console.log(serverResponse)

        } catch (err) {

        }

    }
    return (
        <>
            <div className="shadow-xl bg-white rounded-lg p-3 w-full mb-2">
                <div className='flex gap-3'>
                    <input type="text"
                        value={excelUrl.url}
                        onChange={(e) => setExcelUrl({ url: e.target.value })}
                        placeholder="Enter Excel URL"
                        name='url'
                        className="border border-gray-300 rounded w-4/5" />
                    <Button disabled={!excelUrl.url} onClick={fetchExcelData} children={'Connect'} className={`${!excelUrl.url ? 'cursor-not-allowed button button_ac opacity-45' : 'button button_ac'}`} />

                </div>
            </div>
        </>
    )
}

export default LiveExcelSheet