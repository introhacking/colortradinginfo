import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../../../services/apiService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner';

const VideoUpload_Edit_Form = ({ isOpen, onClose, editData, refreshData }) => {

    if (!isOpen) return null;

    const [form, setForm] = useState(editData);

    useEffect(() => {
        setForm(editData); // load values when modal opens
    }, [editData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleVideoUpdate = async () => {
        try {
            const payload = {
                name: form.name,
                moduleName: form.newModuleName,
                newModuleName: form.moduleName,
                chapterName: form.newChapterName,
                newChapterName: form.chapterName,
                originalTitle: form.originalTitle,
                newTitle: form.videoTitle,
            };

            const response = await apiService.updatingSpecificVideoById(`/media/${form.id}/video/text`, payload);
            if (response.status === 200) {
                toast.success("Video info updated successfully!");
                refreshData();
                onClose();
            } else {
                toast.error(response.data?.message || "Failed to update");
            }
        } catch (err) {
            toast.error("Failed to update");
        }
    };

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-2/5 mx-auto bg-white rounded'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 bg-purple-500 p-2 rounded-t'>
                    <p className='font-medium text-white text-[18px]'>Updating Id: <span className='text-sm'>{editData.id}</span></p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>

                <form action="POST" className='space-y-2 px-4 py-2'>
                    <div className='flex gap-2'>
                        <div className='w-1/2 relative'>
                            <input
                                className='for_input peer'
                                value={form.name}
                                type="text"
                                id='name'
                                name='name'
                                onChange={handleChange}
                            />
                            <label htmlFor="name" className='for_label'>Media Name</label>
                        </div>

                        <div className='w-1/2 relative'>
                            <input
                                className='for_input peer'
                                value={form.moduleName || form.newModuleName}
                                type="text"
                                id='moduleName'
                                name='moduleName'
                                onChange={handleChange}
                            />
                            <label htmlFor="moduleName" className='for_label'>Module Name</label>
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <div className='w-1/2 relative'>
                            <input
                                className='for_input peer'
                                value={form.chapterName || form.newChapterName}
                                type="text"
                                id='chapterName'
                                name='chapterName'
                                onChange={handleChange}
                            />
                            <label htmlFor="chapterName" className='for_label'>Chapter Name</label>
                        </div>

                        <div className='w-1/2 relative'>
                            <input
                                className='for_input peer'
                                value={form.videoTitle || form.newvideoTitle}
                                type="text"
                                id='videoTitle'
                                name='videoTitle'
                                onChange={handleChange}
                            />
                            <label htmlFor="videoTitle" className='for_label'>Video Title</label>
                        </div>
                    </div>
                </form>

                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={handleVideoUpdate} className={'button button_ac'} type="button" children={'Update'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default VideoUpload_Edit_Form