import React, { useState } from 'react'
import { bankingService } from '../../../services/bankingService';
import { toast } from 'sonner';
import Button from '../../componentLists/Button';

const VideoUpload_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // const [progress, setProgress] = useState(0);

    const [videoInfo, setVideoInfo] = useState({ video_name: '' });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [progress, setProgress] = useState(null);
    const [error, setError] = useState('');

    const validateFile = (file) => {
        const validTypes = ['video/mp4'];
        if (!validTypes.includes(file.type)) {
            toast.error('Invalid file type. Please upload a Valid format.');
            return false;
        }
        return true;
    };

    const handleFileChange = (e) => {
        const file = e.target.files;
        if (validateFile(file[0])) {
            setSelectedFiles(file);
        }
        return false
    };

    const videoInfoChange = (e) => {
        const { name, value } = e.target
        setVideoInfo({ ...videoInfo, [name]: value })
    }

    const handleUpload = async () => {
        if (!videoInfo) {
            toast.error('Please Choose Video file');
            return;
        }

        let formData = new FormData()
        for (let key in selectedFiles) {
            formData.append('videos', selectedFiles[key])
        }
        formData.append('video_name', videoInfo.video_name)
        try {
            setError('');
            setProgress(0);
            await bankingService.postFormInfoToServer('media', formData, {
                onUploadProgress: (data) => {
                    const percentage = Math.round((data.loaded / data.total) * 100);
                    setProgress(percentage);
                }

            });
            setProgress(100);

            // ⏰ Optional delay before hiding progress bar
            setTimeout(() => setProgress(0), 1000);
            
            toast.success(`Data successfully uploaded`);
            // console.log(data?.data && JSON.stringify(csvData))
        } catch (error) {
            setError('Error fetching CSV data. Please try again.');
            // toast.error('File upload failed. Please try again.');
        }
    };

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>Upload Video</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='max-h-[60vh] overflow-y-auto no-scrollbar py-4 px-4'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex gap-2'>
                            <div className='w-full flex items-end gap-0.5'>
                                <div className='w-full flex justify-content-between items-center gap-2 '>
                                    <div className='w-full relative'>
                                        <input onChange={(e) => videoInfoChange(e)} value={videoInfo.video_name} className='for_input p-2 peer focus:ring-0 text-gray-500' type="text" id='video_name' name='video_name' placeholder='' />
                                        <label className='for_label'>Video name</label>
                                    </div>
                                    <div className='w-full relative'>
                                        <input onChange={(e) => handleFileChange(e)} className='for_input peer focus:ring-0 text-gray-500' type="file" id='videos' name='videos' accept='.mkv, .mp4' placeholder='' />
                                        <label htmlFor='videos' className='for_label'>Video path</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {progress > 0 &&
                            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-200">
                                <div className="bg-green-800 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" aria-valuenow={progress} aria-valuemax={100} style={{ width: `${progress}%` }} >{progress}%</div>
                            </div>
                        }

                        {/* {progress > 0 && <div className='text-sm'>processing: <span className='text-green-800'>{progress}%</span></div>} */}
                        <div className='w-full flex justify-end'>
                            <Button
                                onClick={() => handleUpload()}
                                className={`button ${!videoInfo ? 'bg-cyan-500/50' : 'bg-cyan-500 hover:bg-cyan-400'} text-white`}
                                children={'Upload'}
                                type={'button'}
                                disabled={!videoInfo}
                            />
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

export default VideoUpload_Info_Modal