import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../componentLists/Button';
import { bankingService } from '../../../services/bankingService';

// import { bankingService } from '../../../services/bankingService';

const Technical_Banking_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    // const [fileRead, setFileRead] = useState(null)
    // const [progress, setProgress] = useState(0);

    // const [serverResponseData, setServerResponseData] = useState(null)

    // const validateFile = (fileRead) => {
    //     const allowedExtensions = ['csv', 'xlsx']; // Add other extensions as needed
    //     const fileExtension = fileRead.name.split('.').pop().toLowerCase();

    //     if (!allowedExtensions.includes(fileExtension)) {
    //         toast.error('Invalid file type. Only CSV and Excel files are allowed.');
    //         return false;
    //     }

    //     if (fileRead.size > 5 * 1024 * 1024) { // Example: 5MB limit
    //         toast.error('File size exceeds the maximum limit of 5MB.');
    //         return false;
    //     }

    //     return true;
    // };
    // const fileOnchange = (e) => {
    //     const selectedFile = e.target.files[0];
    //     if (validateFile(selectedFile)) {
    //         setFileRead(selectedFile);
    //     } else {
    //         setFileRead(null);
    //     }
    // }
    // const fileUploadFor_SG = async (e) => {
    //     e.preventDefault()

    //     if (!fileRead) {
    //         toast.error('Please select a valid file before uploading.');
    //         return;
    //     }
    //     const formData = new FormData();
    //     formData.append('techBankingFile_SG', fileRead);
    //     try {
    //         const response = await bankingService.fileUploadingForField('/techBankingFile_SG', formData, {
    //             onUploadProgress: (progressEvent) => {
    //                 const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
    //                 setProgress(percentage);
    //             }
    //         })
    //         setProgress(0)
    //         setServerResponseData(response.data)
    //         toast.success('Technical banking of Sale Growth inserted successfully')
    //     } catch (error) {
    //         setProgress(0);
    //         toast.error(`Error uploading file: ${error.response ? error.response.data.message : error.message}`);
    //     }
    // }


    const [selectedFiles, setSelectedFiles] = useState({ SG: null, OPG: null, NPG: null });
    const [progress, setProgress] = useState({ SG: 0, OPG: 0, NPG: 0 });
    const [serverResponseData, setServerResponseData] = useState({ file1: null, file2: null, file3: null });
    console.log(selectedFiles)

    const validateFile = (file) => {
        const validTypes = ['csv', 'text/csv'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a CSV file.');
            return false;
        }
        return true;
    };

    const handleFileChange = (event, fileKey) => {
        const file = event.target.files[0];
        if (validateFile(file)) {
            setSelectedFiles(prevState => ({ ...prevState, [fileKey]: file }));
        }
    };

    const handleUpload = async (fileKey, endpoint) => {
        const getApendFileTypes= endpoint.split('/')[1]

        const file = selectedFiles[fileKey];
        if (!file) {
            toast.error('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append(getApendFileTypes, file);

        try {
            const response = await bankingService.fileUploadingForField(endpoint, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setProgress(prevState => ({ ...prevState, [fileKey]: percentage }));
                }
            });

            setProgress(prevState => ({ ...prevState, [fileKey]: 0 }));
            setServerResponseData(prevState => ({ ...prevState, [fileKey]: response.data }));
            toast.success(`File uploaded successfully for ${fileKey}`);
        } catch (error) {
            setProgress(prevState => ({ ...prevState, [fileKey]: 0 }));
            toast.error('File upload failed. Please try again.');
        }
    };


    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>Technical Banking File Uploading</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="techBankingCSVFile_SG" className='font-medium'>Sale growth file upload</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='techBankingCSVFile_SG'
                                        name='techBankingCSVFile_SG'
                                        accept='.csv'
                                        onChange={(event) => handleFileChange(event, 'SG')}
                                    />
                                    {progress.SG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.SG === 100 ? 'Done' : `${progress.SG}%`}</span></div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleUpload('SG', '/techBankingCSVFile_SG')}
                                    className={`button ${!selectedFiles.SG ? 'bg-cyan-500/50':'bg-cyan-500 hover:bg-cyan-400' } text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedFiles.SG}
                                />
                            </div>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="techBankingCSVFile_OPG" className='font-medium'>Operating profit growth file upload</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='techBankingCSVFile_OPG'
                                        name='techBankingCSVFile_OPG'
                                        accept='.csv'
                                        onChange={(event) => handleFileChange(event, 'OPG')}
                                    />
                                     {progress.OPG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.OPG === 100 ? 'Done' : `${progress.OPG}%`}</span></div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleUpload('OPG', '/techBankingCSVFile_OPG')}
                                    className={`button ${!selectedFiles.OPG ? 'bg-cyan-500/50':'bg-cyan-500 hover:bg-cyan-400' } text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedFiles.OPG}
                                />
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="techBankingCSVFile_NPG" className='font-medium'>Net profit growth file upload</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='techBankingCSVFile_NPG'
                                        name='techBankingCSVFile_NPG'
                                        accept='.csv'
                                        onChange={(event) => handleFileChange(event, 'NPG')}
                                    />
                                      {progress.NPG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.NPG === 100 ? 'Done' : `${progress.NPG}%`}</span></div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handleUpload('NPG', '/techBankingCSVFile_NPG')}
                                    className={`button ${!selectedFiles.NPG ? 'bg-cyan-500/50':'bg-cyan-500 hover:bg-cyan-400' } text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedFiles.NPG}
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

export default Technical_Banking_Info_Modal