import React, { useState } from 'react'
import Button from '../../componentLists/Button';
import { bankingService } from '../../../services/bankingService';
import { toast } from 'sonner';

const DeleteLiveNSEDataModal = ({ isOpen, onClose, data }) => {
    if (!isOpen) return null;

    const [stockNameHandle, setStockNameHandle] = useState({
        stockname: ''
    })

    const [errors, setErrors] = useState('');

    const deleteHandler = async () => {
        const input = stockNameHandle.stockname

        // Now POST to your backend API
        // try {
        //     const serverResponse = await bankingService.postFormInfoToServer('add-live-stock', { stockNames: stockArray })
        //     if (serverResponse.success) {
        //         const { message, skipped = [] } = serverResponse;

        //         // Build the full toast message
        //         const fullMessage = skipped.length > 0
        //             ? `${message} (Skipped: ${skipped.join(', ')})`
        //             : message;

        //         toast.success(fullMessage);
        //     } else {
        //         toast.warn(serverResponse.message || 'No new stock names added.');
        //     }
        //     console.log(serverResponse)
        // } catch (err) {
        //     setErrors(err.message)
        //     console.error('Error sending to backend:', err.message);
        // }
    }
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-2/5 mx-auto bg-white rounded'>
                <div className='rounded bg-purple-400 flex w-full items-center justify-between font-medium text-xl mb-2 p-2'>
                    <p className='font-medium text-white text-[18px]'>Add StockName</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[25vh] flex flex-col justify-between overflow-y-auto no-scrollbar p-2'>
                    <form action="POST" className='space-y-2'>
                        <div className='gap-2'>
                            <input onChange={(e) => { setStockNameHandle({ stockname: e.target.value }); setErrors(''); }} value={stockNameHandle.stockname} name='stockName' type='text' className='p-2' placeholder='Enter Single or Bulk (comma seperator)' />
                        </div>
                        {errors && <p style={{ color: 'red' }}>{errors}</p>}
                    </form>
                    <div className='flex justify-end items-center gap-2 mt-4 p-2'>
                        <Button onClick={deleteHandler} children={'Add'} className={'button button_cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteLiveNSEDataModal