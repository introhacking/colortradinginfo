import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../../../services/apiService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner';

const MidCap_Edit_Modal = ({ isOpen, onClose, isParamsData }) => {
    const { _id } = isParamsData

    if (!isOpen) return null;
    const [ITInfo, setITInfo] = useState({
        stockName: '',
        monthlyData: '',
    })

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setITInfo({ ...ITInfo, [name]: value })
    }

    const updatingBankDescription = async () => {
        // Split the monthlyData string into an array of numbers
        try {
            const monthlyDataArray = ITInfo.monthlyData.split(',').map(Number);
            const toUpdatingData = {
                stockName: ITInfo.stockName,
                monthlyData: monthlyDataArray
            }
            await apiService.updatingById('mid-cap', _id, toUpdatingData)
            toast.success(`${toUpdatingData.stockName} updated successfully`)
        } catch (err) {
            toast.error(err)
        }
    }
    const updateMonthlyData = (array) => {
        // Convert array to comma-separated string
        const monthlyDataString = array.monthlyData.join(',');
        // Update the state with the new monthlyData string
        setITInfo({ ...array, monthlyData: monthlyDataString });
    };


    useEffect(() => {
        updateMonthlyData(isParamsData)
    }, [isParamsData])

    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 bg-purple-500 p-2 rounded-t'>
                    <p className='font-medium text-white text-[18px]'>Updating Id : <span className='text-sm'>{_id}</span></p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className=''> {/* h-[50vh] overflow-y-auto*/}
                    <form action="POST" className='space-y-2 px-2 py-1'>
                        <div className='flex justify-center items-center gap-2'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full relative select-none'>
                                    <input className='for_input peer' value={ITInfo.stockName} type="text" id='stockName' name='stockName' placeholder='' onChange={onChangeHandler} />
                                    <label className='for_label'>Stock name</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    <input className='bg-gray-100' value={ITInfo.monthlyData} type="text" id='monthlyData' name='monthlyData' onChange={onChangeHandler} />
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className='flex justify-end items-center gap-2 p-2'>
                        <Button onClick={() => { updatingBankDescription() }} className={'button button_ac'} type="button" children={'Update'} />
                        <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MidCap_Edit_Modal