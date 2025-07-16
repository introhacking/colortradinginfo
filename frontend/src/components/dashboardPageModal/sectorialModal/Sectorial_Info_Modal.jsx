import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Button from '../../componentLists/Button';
import { apiService } from '../../../services/apiService';

// import { apiService } from '../../../services/apiService';

const Sectorial_Info_Modal = ({ isOpen, onClose }) => {
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
    //         const response = await apiService.fileUploadingForField('/techBankingFile_SG', formData, {
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


    const [sectorialData, setSectorialData] = useState({
        sectorialName: '',
        month: '',
        week: '',
        day: ''
    })
    const validateFile = (file) => {
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/tiff'];
        if (!allowedImageTypes.includes(file.type)) {
            toast.error('Invalid images type. Please upload a PNG, JPG, JPEG format.');
            // setSectorialData({ Month: null, Week: null, Day: null })
            return false;
        }
        return true;
    };


    // const converBase64 = (file) => {
    //     return new Promise((resolve, reject) => {
    //         const fileReader = new FileReader()
    //         fileReader.readAsDataURL(file);
    //         fileReader.onload = () => {
    //             resolve(fileReader.result)
    //         }
    //         fileReader.onerror = (error) => {
    //             reject(error)
    //         }
    //     })
    // }
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        // const base64 = await converBase64(file)
        const { name } = e.target;
        if (validateFile(file)) {
            setSectorialData(prevState => ({ ...prevState, [name]: file }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSectorialData(prevState => ({ ...prevState, [name]: value }));
    };
    const handleUpload = async () => {
        // console.log(sectorialData)
        const formData = new FormData();
        formData.append('sectorialName', sectorialData.sectorialName);
        if (sectorialData.month) formData.append('month', sectorialData.month);
        if (sectorialData.week) formData.append('week', sectorialData.week);
        if (sectorialData.day) formData.append('day', sectorialData.day);

        try {
            const response = await apiService.postFormInfoToServer('sector', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            toast.success(response.message);
            console.log(sectorialData)
        } catch (error) {
            // console.error(error);
            toast.error(error.message);
        }





        // const getApendFileTypes = endpoint.split('/')[1]

        // const file = selectedImage[imageKey];
        // if (!file) {
        //     toast.error('Please select a file to upload.');
        //     return;
        // }

        // const formData = new FormData();
        // formData.append(getApendFileTypes, file);

        // try {
        //     const response = await apiService.fileUploadingForField(endpoint, formData, {
        //         onUploadProgress: (progressEvent) => {
        //             const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        //             setProgress(prevState => ({ ...prevState, [imageKey]: percentage }));
        //         }
        //     });

        //     setProgress(prevState => ({ ...prevState, [imageKey]: 0 }));
        //     setServerResponseData(prevState => ({ ...prevState, [imageKey]: response.data }));
        //     toast.success(`File uploaded successfully for ${imageKey}`);
        // } catch (error) {
        //     setProgress(prevState => ({ ...prevState, [imageKey]: 0 }));
        //     toast.error('File upload failed. Please try again.');
        // }
    };


    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>Sectorial Uploading</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='w-1/2 flex items-center mt-4'>
                            <div className='w-full relative'>
                                <input
                                    className='for_input peer'
                                    type="text"
                                    id='sectorialName'
                                    name='sectorialName'
                                    value={sectorialData.sectorialName}
                                    onChange={(e) => handleInputChange(e)}
                                    placeholder=''
                                />
                                <label htmlFor="sectorialMonth_img" className='for_label'>Sectorial Name</label>
                            </div>
                        </div>

                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="sectorialMonth_img" className='font-medium'>Image for Month</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='sectorialMonth_img'
                                        name='month'
                                        accept="image/*"
                                        // value={sectorialData.Month}
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                    {/* {progress.SG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.SG === 100 ? 'Done' : `${progress.SG}%`}</span></div>
                                    )} */}
                                </div>
                                {/* <Button
                                    onClick={() => handleUpload()}
                                    className={`button ${!sectorialData.Month ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!sectorialData.Month}
                                /> */}
                            </div>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="sectorialWeek_img" className='font-medium'>Image for week</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='sectorialWeek_img'
                                        name='week'
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                    {/* {progress.OPG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.OPG === 100 ? 'Done' : `${progress.OPG}%`}</span></div>
                                    )} */}
                                </div>
                                {/* <Button
                                    onClick={() => handleUpload('OPG', '/techBankingCSVFile_OPG')}
                                    className={`button ${!selectedImage.OPG ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedImage.OPG}
                                /> */}
                            </div>
                        </div>
                        <div className='flex gap-2'>
                            <div className='w-1/2 flex items-end gap-0.5'>
                                <div>
                                    <label htmlFor="sectorialDay_img" className='font-medium'>Image for Day</label>
                                    <input
                                        className='p-0.5'
                                        type="file"
                                        id='sectorialDay_img'
                                        name='day'
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e)}
                                    />
                                    {/* {progress.NPG > 0 && (
                                        <div className='text-sm'>Uploading process: <span className='text-green-800'>{progress.NPG === 100 ? 'Done' : `${progress.NPG}%`}</span></div>
                                    )} */}
                                </div>
                                {/* <Button
                                    onClick={() => handleUpload('NPG', '/techBankingCSVFile_NPG')}
                                    className={`button ${!selectedImage.NPG ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                    children={'Upload'}
                                    type={'button'}
                                    disabled={!selectedImage.NPG}
                                /> */}
                            </div>
                        </div>
                    </form>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={handleUpload} className={'button button_ac'} type={'button'} children={'Submit'} />
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Sectorial_Info_Modal