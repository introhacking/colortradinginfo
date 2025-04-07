import React, { useEffect, useState } from 'react'
import Button from '../../componentLists/Button';
import Loading from '../../../Loading';

const Technical_Banking_Edit_Modal = ({ isOpen, onClose, isParamsData }) => {
    if (!isOpen) return null;

    const [isDataLoading, setIsDataLoading] = useState(false)
    const { _id } = isParamsData
    const [ITInfo, setITInfo] = useState({
        Bank_name: '',
        January: '',
        February: '',
        March: '',
        April: '',
        May: '',
        June: '',
        July: '',
        August: '',
        September: '',
        October: '',
        November: '',
        December: '',
        // monthlyData: '',
    })
    const updateMonthlyData = (objectData) => {
        setITInfo(objectData);
        setIsDataLoading(false)
    };
    useEffect(() => {
        setIsDataLoading(true)
        updateMonthlyData(isParamsData)
    }, [isParamsData])

    return (
        <div className='absolute inset-0 bg-black/60 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 bg-purple-500 p-2 rounded-t'>
                    <p className='font-medium text-white text-[18px]'>Updating Id : <span className='text-sm'>{_id}</span></p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                {isDataLoading && < Loading msg='Fetching... please wait' />}
                {!isDataLoading && (
                    <div className='h-[60vh] overflow-y-auto'> {/* h-[50vh] overflow-y-auto*/}
                        <form action="POST" className='space-y-4 px-2 py-1'>
                            <div className='flex justify-start items-center'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.Bank_name} type="text" id='Bank_name' name='Bank_name' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="Bank_name" className='for_label'>Bank name</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.January} type="text" id='janurary' name='Janurary' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="janurary" className='for_label'>Janurary</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.February} type="text" id='february' name='February' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="february" className='for_label'>February</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.March} type="text" id='march' name='March' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="march" className='for_label'>March</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.April} type="text" id='april' name='April' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="april" className='for_label'>April</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.May} type="text" id='may' name='May' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="may" className='for_label'>May</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.June} type="text" id='june' name='June' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="june" className='for_label'>June</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.July} type="text" id='july' name='July' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="july" className='for_label'>July</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.August} type="text" id='august' name='August' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="august" className='for_label'>August</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.September} type="text" id='september' name='september' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="september" className='for_label'>September</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.October} type="text" id='october' name='October' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="october" className='for_label'>October</label>
                                    </div>
                                </div>
                            </div>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.November} type="text" id='november' name='november' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="november" className='for_label'>November</label>
                                    </div>
                                </div>
                                <div className='w-1/2 flex items-center'>
                                    <div className='w-full relative'>
                                        <input className='for_input peer' value={ITInfo.December} type="text" id='december' name='December' placeholder="" /> {/*onChange={onChangeHandler}*/}
                                        <label htmlFor="december" className='for_label'>December</label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
                <div className='flex justify-end items-center gap-2 p-2'>
                    <Button onClick={() => { updatingBankDescription() }} className={'button button_ac'} type="button" children={'Update'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Technical_Banking_Edit_Modal