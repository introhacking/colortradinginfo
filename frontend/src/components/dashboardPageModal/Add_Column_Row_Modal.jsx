import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { column_Data, row_Data } from '../../row_Column_Config/row_column_config';
import axios from 'axios'
import Button from '../componentLists/Button';
import { apiService } from '../../services/apiService';

const Add_Column_Row_Modal = ({ createTableModal }) => {
    const [rows, setRows] = useState(5);
    const [columns, setColumns] = useState(3);
    const [columnName, setColumnName] = useState('');
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const savedRows = localStorage.getItem('rows');
        const savedColumns = localStorage.getItem('columns');
        const savedTableData = localStorage.getItem('tableData');

        if (savedRows && savedColumns && savedTableData) {
            setRows(parseInt(savedRows));
            setColumns(parseInt(savedColumns));
            setTableData(JSON.parse(savedTableData));
        }
    }, []);

    const handleRowChange = (e) => {
        setRows(parseInt(e.target.value));
    };

    const handleColumnChange = (e) => {
        setColumns(parseInt(e.target.value));
    };

    const createTableAndSave = async () => {
        const newData = Array.from({ length: rows }, (_, rowIndex) =>
            Array.from({ length: columns }, (_, colIndex) =>
                tableData[rowIndex] && tableData[rowIndex][colIndex] ? tableData[rowIndex][colIndex] : { row_column: [rowIndex, colIndex] }
            )
        );
        const customModifiedData = [{
            rows,
            columns,
        }]
        // setTableData(newData);
        try {
            const creatingResponse = await apiService.postFormInfoToServer('/itCreate', customModifiedData)
            console.log(creatingResponse)
            toast.success('Create Successfully')

        } catch (err) {

        }
        // console.log(newData)
        // console.log(tableData)

        localStorage.setItem('rows', rows);
        localStorage.setItem('columns', columns);
        localStorage.setItem('tableData', JSON.stringify(newData));
        // createTableModal(false);
    };

    const [fileName, setFileName] = useState('')
    const [fileRead, setFileRead] = useState('')
    const [progress, setProgress] = useState(null);

    const fileOnchange = (e) => {
        const excelData = e.target.files[0]
        setFileRead(excelData)
    }

    const fileUpload = async (e) => {
        e.preventDefault()
        const formData = new FormData();
        formData.append('excelSheet', fileRead);
        try {
            const response = await axios.post('/api/v1/excelRead', formData, {
                onUploadProgress: (progressEvent) => {
                    const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setProgress(percentage);
                },
            })
            setProgress(0)
            // localStorage.setItem(fileName, JSON.stringify(response.data))
            toast.success(response.data)
            console.log(response.data)
        } catch (error) {
            toast.error('Error uploading file:', error.message);
        }
    }


    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white p-4'>
                <div className='flex w-full justify-end font-medium text-xl text-white mb-2'>
                    <p onClick={() => createTableModal(false)} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div>
                    <form action="POST" className='space-y-4'>
                        <div className=''>
                            <label htmlFor="">Column Name</label>
                            <input type="text" value={columnName} onChange={(e) => { setColumnName(e.target.value) }} />
                        </div>
                        <div className='flex gap-2'>
                            <div className='w-1/2'>
                                <label htmlFor="">No. of Rows</label>
                                <input type="number" value={rows} onChange={handleRowChange} />
                            </div>
                            <div className='w-1/2'>
                                <label htmlFor="">No. of Columns</label>
                                <input type="number" value={columns} onChange={handleColumnChange} />
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <div className='w-1/2'>
                                <label htmlFor="fileName">File Name to Save </label>
                                <input type="text" id='fileName' name='fileName' value={fileName} onChange={(e) => { setFileName(e.target.value) }} />
                            </div>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="excelSheet">File Upload</label>
                                    <input className='p-0.5' type="file" id='excelSheet' name='excelSheet' onChange={fileOnchange} />
                                    {progress > 0 && <div className='text-sm'>processing: <span className='text-green-800'>{progress}%</span></div>}
                                </div>
                                {/* <button onClick={() => fileUpload()} className='px-2 py-[4.5px] bg-green-600 text-white mt-6' type="button">Upload</button> */}
                                <Button onClick={fileUpload} className={'button bg-cyan-500 hover:bg-cyan-400 text-white'} children={'Upload'} type={'button'} />
                            </div>
                        </div>
                    </form>
                    <div className='flex gap-2 justify-end mt-4'>
                        <Button onClick={createTableAndSave} className={'button button_ac'} type={'button'} children={'Create Table & Save'} />
                        <Button onClick={() => createTableModal(false)} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Add_Column_Row_Modal