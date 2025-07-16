import React, { useState } from 'react'
import { apiService } from '../../../services/apiService';
import { toast } from 'sonner';
import Button from '../../componentLists/Button';

const Delivery_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [progress, setProgress] = useState(0);

    const validateFile = (file) => {
        const validTypes = ['csv', 'text/csv'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a CSV file.');
            return false;
        }
        return true;
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (validateFile(file)) {
            setSelectedFiles(file);
        }
        return false
    };
    const handleUpload = async () => {
        if (!selectedFiles) {
            toast.error('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('deliveryCSVFile', selectedFiles);

        try {
            const response = await apiService.fileUploadingForField('/deliveryCSVFile', formData, {
                onUploadProgress: (progressEvent) => {
                    const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setProgress(percentage);
                }
            });

            setProgress(0);
            toast.success(`File uploaded successfully`);
        } catch (error) {
            setProgress(0);
            toast.error('File upload failed. Please try again.');
        }
    };

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>File Uploading</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="deliveryCSVFile" className='font-medium'>Delivery file upload</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='deliveryCSVFile'
                                        name='deliveryCSVFile'
                                        accept='.csv'
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                    {progress > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress === 100 ? 'Done' : `${progress}%`}</span></div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleUpload()}
                                    className={`button ${!selectedFiles ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedFiles}
                                />
                            </div>

                        </div>

                    </form>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Delivery_Info_Modal