import React from 'react'
import { apiService } from '../../../services/apiService.js'
import Button from '../../componentLists/Button';
import { toast } from 'sonner'



const AlertModal = ({ isOpen, onClose, deletingRoute, tableName , callFunction }) => {
    if (!isOpen) return null;
    
    console.log(deletingRoute , tableName)
    const deleteTableData = async () => {
        try {
            const serverResponse = await apiService.truncateTable(deletingRoute)
            if (serverResponse.status === 200) toast.success(serverResponse.data)
            onClose();
            callFunction()
        } catch (err) {
            toast.error(err.message)
        }
    }

    return (

        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-2/5 rounded mx-auto bg-white'>
                <div className='flex w-full items-center justify-between font-medium text-xl bg-red-400 rounded-t px-2 py-1'>
                    <p className='font-medium text-white '>Fingin Alert</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='p-2'>
                    <div className='bg-red-100 px-4 py-2 rounded'>
                        <p className='text-red-600'>Are you sure? Deleting a table <span className='font-medium text-red-600'>{`'${tableName ? tableName : ''}'`}</span> results in loss of all information stored in the table.</p>
                    </div>
                </div>
                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={deleteTableData} className={'button button_ac'} type="button" children={'Yes, Delete'} />
                    {/* <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} /> */}
                </div>
            </div>
        </div>

    )
}

export default AlertModal