import React, { useState } from 'react';
import { apiService } from '../../../services/apiService';
import { toast } from 'sonner';
import Button from '../../componentLists/Button';
import CircularProgress from '../../../components/componentLists/CircularProgress'

const VideoUpload_Info_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [video_name, setVideoName] = useState('');
    const [modules, setModules] = useState([
        {
            moduleName: '',
            chapters: [
                {
                    chapterName: '',
                    videos: [
                        { title: '', file: null }
                    ]
                }
            ]
        }
    ]);
    const [progress, setProgress] = useState(null);

    // Add functions to handle input changes
    const handleModuleChange = (index, value) => {
        const updatedModules = [...modules];
        updatedModules[index].moduleName = value;
        setModules(updatedModules);
    };

    const handleChapterChange = (mIndex, cIndex, value) => {
        const updatedModules = [...modules];
        updatedModules[mIndex].chapters[cIndex].chapterName = value;
        setModules(updatedModules);
    };

    const handleVideoTitleChange = (mIndex, cIndex, vIndex, value) => {
        const updatedModules = [...modules];
        updatedModules[mIndex].chapters[cIndex].videos[vIndex].title = value;
        setModules(updatedModules);
    };

    const handleVideoFileChange = (mIndex, cIndex, vIndex, file) => {
        const updatedModules = [...modules];
        updatedModules[mIndex].chapters[cIndex].videos[vIndex].file = file;
        setModules(updatedModules);
    };

    const addModule = () => {
        setModules([...modules, {
            moduleName: '',
            chapters: [
                {
                    chapterName: '',
                    videos: [{ title: '', file: null }]
                }
            ]
        }]);
    };

    const addChapter = (mIndex) => {
        const updatedModules = [...modules];
        updatedModules[mIndex].chapters.push({
            chapterName: '',
            videos: [{ title: '', file: null }]
        });
        setModules(updatedModules);
    };

    const addVideo = (mIndex, cIndex) => {
        const updatedModules = [...modules];
        updatedModules[mIndex].chapters[cIndex].videos.push({ title: '', file: null });
        setModules(updatedModules);
    };

    const handleUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('video_name', video_name);

            // Serialize structure with only title, no file
            const structuredModules = modules.map(module => ({
                moduleName: module.moduleName,
                chapters: module.chapters.map(chapter => ({
                    chapterName: chapter.chapterName,
                    videos: chapter.videos.map(video => video.title)
                }))
            }));

            formData.append('modules', JSON.stringify(structuredModules));

            // Append all files
            modules.forEach(module => {
                module.chapters.forEach(chapter => {
                    chapter.videos.forEach(video => {
                        if (video.file) {
                            formData.append('videos', video.file);
                        }
                    });
                });
            });

            setProgress(0);

            await apiService.postFormInfoToServer('media', formData, {
                onUploadProgress: (data) => {
                    const percent = Math.round((data.loaded / data.total) * 100);
                    setProgress(percent);
                    setTimeout(() => setProgress(null), 1000);
                }
            });

            toast.success("Videos uploaded successfully");
            onClose();
        } catch (error) {
            toast.error("Upload failed. Please try again.");
        }
    };

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 overflow-y-auto bg-white rounded p-6'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-bold text-black'>Upload Video</h2>
                    <button onClick={onClose} className='button button_cancel'>X</button>
                </div>
                <div className='max-h-[60vh] overflow-y-auto no-scrollbar p-1'>
                    <div className='mb-4'>
                        <label className='font-medium'>Video Collection Name</label>
                        <input
                            className='w-full p-2 border rounded'
                            type='text'
                            name='video_name'
                            value={video_name}
                            onChange={e => setVideoName(e.target.value)}
                            placeholder='e.g., React Course'
                        />
                    </div>

                    {modules.map((module, mIndex) => (
                        <div key={mIndex} className='border p-4 mb-4 rounded'>
                            <h3 className='font-semibold mb-2'>Module {mIndex + 1}</h3>
                            <input
                                className='w-full p-2 border mb-2 rounded'
                                placeholder='Module Name'
                                value={module.moduleName}
                                onChange={e => handleModuleChange(mIndex, e.target.value)}
                            />
                            {module.chapters.map((chapter, cIndex) => (
                                <div key={cIndex} className='border p-3 mb-2 rounded bg-gray-50'>
                                    <h4 className='font-semibold'>Chapter {cIndex + 1}</h4>
                                    <input
                                        className='w-full p-2 border mb-2 rounded'
                                        placeholder='Chapter Name'
                                        value={chapter.chapterName}
                                        onChange={e => handleChapterChange(mIndex, cIndex, e.target.value)}
                                    />
                                    {chapter.videos.map((video, vIndex) => (
                                        <div key={vIndex} className='flex gap-2 mb-2'>
                                            <input
                                                className='w-1/2 p-2 border rounded'
                                                placeholder='Video Title'
                                                value={video.title}
                                                onChange={e => handleVideoTitleChange(mIndex, cIndex, vIndex, e.target.value)}
                                            />
                                            <input
                                                className='w-1/2 p-2 border rounded'
                                                type='file'
                                                accept='.mp4, .mkv'
                                                onChange={e => handleVideoFileChange(mIndex, cIndex, vIndex, e.target.files[0])}
                                            />
                                        </div>
                                    ))}
                                    <Button onClick={() => addVideo(mIndex, cIndex)} type={'button'} children={'+ Add another Video'} className={'button border border-blue-600 text-blue-700'} />
                                    {/* <button
                                        onClick={() => addVideo(mIndex, cIndex)}
                                        className='text-sm text-blue-600 underline'
                                    >
                                        + Add another video
                                    </button> */}
                                </div>
                            ))}
                            <Button onClick={() => addChapter(mIndex)} type={'button'} children={'+ Add another Chapter'} className={'button border border-green-600 text-green-700'} />
                            {/* <button
                                onClick={() => addChapter(mIndex)}
                                className='text-sm text-green-600 underline'
                            >
                                + Add another chapter
                            </button> */}
                        </div>
                    ))}

                    <Button onClick={addModule} type={'button'} children={'+ Add another Module'} className={'button border border-indigo-600 text-indigo-700'} />

                    {/* <button onClick={addModule} className='text-sm text-indigo-600 underline mb-4'>
                        + Add another module
                    </button> */}
                </div>
                <div className='flex justify-between gap-4'>
                    <div>
                        {progress &&
                            <CircularProgress
                                progress={progress}
                                size={65}
                                strokeWidth={5}
                                circleColor="#e5e7eb"
                                progressColor="#16a34a"
                                textColor="#15803d"
                                textSize="0.9rem"
                                text='uploding...'
                            />
                        }
                    </div>
                    <div className='flex justify-end items-end w-full gap-2'>
                        <Button onClick={handleUpload} className='button bg-cyan-600 text-white'>Upload</Button>
                        <Button onClick={onClose} className='button button_cancel'>Cancel</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoUpload_Info_Modal;
