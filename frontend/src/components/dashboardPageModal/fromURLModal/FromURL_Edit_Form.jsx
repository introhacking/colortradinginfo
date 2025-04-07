import React, { useEffect, useMemo, useRef, useState } from 'react'
import { bankingService } from '../../../services/bankingService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner';

const FromURL_Edit_Form = ({ isOpen, onClose, isParamsData, fetchData }) => {
    if (!isOpen) return null;

    const { _id } = isParamsData
    // console.log(isParamsData)
    const [deliveryInfo, setDeliveryInfo] = useState({
        stockName: '',
        volumnDeliveryData: '',
    })

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setDeliveryInfo({ ...deliveryInfo, [name]: value })
    }

    const updatingDelivery = async () => {
        // Split the volumnDeliveryData string into an array of numbers
        try {
            const monthlyDataArray = deliveryInfo.volumnDeliveryData.split(',').map(Number);
            const toUpdatingData = {
                stockName: deliveryInfo.stockName,
                volumnDeliveryData: monthlyDataArray
            }
            await bankingService.updatingById('delivery', _id, toUpdatingData)
            onClose()
            fetchData()
            toast.success(`${toUpdatingData.stockName} updated successfully`)
        } catch (err) {
            toast.error(err)
        }
    }
    const updateMonthlyData = (array) => {
        // Convert array to comma-separated string
        const monthlyDataString = array.volumnDeliveryData.join(',');
        // Update the state with the new volumnDeliveryData string
        setDeliveryInfo({ ...array, volumnDeliveryData: monthlyDataString });
    };


    useEffect(() => {
        updateMonthlyData(isParamsData)
    }, [isParamsData])

    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 bg-purple-500 p-2 rounded-t'>
                    <p className='font-medium text-white text-[18px]'>Updating Id : <span className='text-sm'>{_id}</span></p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className=''> {/* h-[50vh] overflow-y-auto*/}
                    <form action="POST" className='space-y-2 px-2 py-1'>
                        <div className='flex justify-center items-center gap-2'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full relative'>
                                    <input className='for_input peer' value={deliveryInfo.stockName} type="text" id='stockName' name='stockName' placeholder="" onChange={onChangeHandler} />
                                    <label htmlFor="stockName" className='for_label'>Stock name</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    <input className='bg-gray-100' value={deliveryInfo.volumnDeliveryData} type="text" id='volumnDeliveryData' name='volumnDeliveryData' onChange={onChangeHandler} />
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className='flex justify-end items-center gap-2 p-2'>
                        <Button onClick={() => { updatingDelivery() }} className={'button button_ac'} type="button" children={'Update'} />
                        <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FromURL_Edit_Form