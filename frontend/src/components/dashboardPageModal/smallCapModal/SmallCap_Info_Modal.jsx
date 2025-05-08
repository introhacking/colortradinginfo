import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import axios from 'axios'
import Button from '../../componentLists/Button';

const SmallCap_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [fileRead, setFileRead] = useState(null)
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
            formData.append('small_ExcelSheet', fileRead);
            try {
                const response = await axios.post('/api/v1/small_excelRead', formData, {
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
        else {
            toast.error('File is required!')
        }
    }


    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white p-4'>
                <div className='flex w-full justify-end font-medium text-xl text-white mb-2'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="small_ExcelSheet">File Upload</label>
                                    <input className='p-0.5 w-full' type="file" id='small_ExcelSheet' name='small_ExcelSheet' accept='.txt' onChange={fileOnchange} />
                                    {progress > 0 && <div className='text-sm'>processing: <span className='text-green-800'>{progress}%</span></div>}
                                </div>
                                {/* <button onClick={() => fileUpload()} className='px-2 py-[4.5px] bg-green-600 text-white mt-6' type="button">Upload</button> */}
                                <Button disabled={!fileRead} onClick={fileUpload} className={`button ${!fileRead ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`} children={'Upload'} type={'button'} />
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

export default SmallCap_Info_Modal