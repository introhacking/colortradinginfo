import React from 'react'
import { apiService } from '../../../services/apiService.js'
import Button from '../../componentLists/Button';
import { toast } from 'sonner'



const DeleteModal = ({ isOpen, onClose, isDeletingId }) => {
    if (!isOpen) return null;
    const { _id, stockName, deletingPath } = isDeletingId

    const deleteTableRowsData = async () => {
        try {
            const serverResponse = await apiService.deletingById(`/${deletingPath}`, _id)
            toast.success(serverResponse.data)
            onClose();
        } catch (err) {
            toast.error('Something went wrong!')
        }
    }

    return (

        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-2/5 rounded mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl bg-red-400 rounded-t px-2 py-1'>
                    <p className='font-medium text-white '>Delete Confirmation Alert</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <div className='bg-red-100 px-4 py-2 rounded'>
                        <p className='text-red-600'>Are you sure you want to delete the Stock '<span className='font-medium'>{stockName}</span>'?</p>
                    </div>
                </div>
                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={deleteTableRowsData} className={'button button_ac'} type="button" children={'Yes, Delete'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'No, Keep it'} />
                </div>
            </div>
        </div>

    )
}

export default DeleteModal