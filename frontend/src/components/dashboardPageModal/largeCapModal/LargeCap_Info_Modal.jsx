import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import Button from '../../componentLists/Button';
// import { apiService } from '../../../services/apiService';

const LargeCap_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [fileRead, setFileRead] = useState('')
    const [progress, setProgress] = useState(0);
    const [serverResponseData, setServerResponseData] = useState(null)

    const fileOnchange = (e) => {
        const excelData = e.target.files[0]
        setFileRead(excelData)
    }

    const fileUpload = async (e) => {
        e.preventDefault()
        if (fileRead) {
            const formData = new FormData();
            formData.append('excelSheet', fileRead);
            try {
                const response = await axios.post('/api/v1/large_excelRead', formData, {
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setProgress(percentage);
                    },
                })
                setProgress(0)
                setServerResponseData(response.data)
                onClose()
                toast.success('Stocks inserted successfully')
            } catch (error) {
                setProgress(0);
                toast.error(`Error uploading file: ${error.response ? error.response.data.message : error.message}`);
            }
        }
        else{
            toast.error('File is required!')
        }

    }


    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex w-full justify-end font-medium text-xl text-white p-2 shadow'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="excelSheet">File Upload</label>
                                    <input className='p-0.5' type="file" id='excelSheet' name='excelSheet' accept='.txt' onChange={fileOnchange} />
                                    {progress > 0 && <div className='text-sm'>processing: <span className='text-green-800'>{progress}%</span></div>}
                                </div>
                                <Button onClick={fileUpload} className={'button bg-cyan-500 hover:bg-cyan-400 text-white'} children={'Upload'} type={'button'} />
                            </div>
                        </div>
                    </form>
                    <div className='overflow-y-auto no-scrollbar h-[40vh] p-3 my-3 border'>
                        {
                            serverResponseData?.length > 0 ? JSON.stringify(serverResponseData) : 'Server response during file upload!'
                        }
                    </div>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    {/* <Button onClick={createTableAndSave} className={'button button_ac'} type={'button'} children={'Create Table & Save'} /> */}
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default LargeCap_Info_Modal