import React, { useState } from 'react'
import Button from '../../componentLists/Button';

const Research_Add_Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [reSearchInfo, setReSearchInfo] = useState({
        stock_name: '',
        buy_sell: '',
        trigger_price: '',
        target_price: '',
        stop_loss: '',
        chart: '',
        rationale: ''
    })
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReSearchInfo(prevState => ({ ...prevState, [name]: value }));
    };
    const handleUpload = async () => {
        console.log(reSearchInfo)
    }
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full justify-between items-center font-medium text-xl text-white p-2 shadow'>
                    <p className='text-xl text-black'>Add Research Details</p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar py-2 px-4'>
                    <form action="POST" className='space-y-2'>
                        <div className='flex items-center gap-4'>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='stock_name'
                                        name='stock_name'
                                        value={reSearchInfo.stock_name}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="stock_name" className='for_label'>Stock Name</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <select name="buy_sell" id="buy_sell" onChange={(e) => { handleInputChange(e) }}>
                                        <option value="">--Choose Buy or Sell--</option>
                                        <option value="buy">Buy</option>
                                        <option value="sell">Sell</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='trigger_price'
                                        name='trigger_price'
                                        value={reSearchInfo.trigger_price}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="trigger_price" className='for_label'>Trigger Price</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='target_price'
                                        name='target_price'
                                        value={reSearchInfo.target_price}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="target_price" className='for_label'>Target Price</label>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='stop_loss'
                                        name='stop_loss'
                                        value={reSearchInfo.stop_loss}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="stop_loss" className='for_label'>Stop Loss</label>
                                </div>
                            </div>
                            {/* <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='stockName'
                                        name='stockName'
                                        value={reSearchInfo.stock_name}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="stockName" className='for_label'>Stock Name</label>
                                </div>
                            </div> */}
                        </div>
                        {/* <div className='flex items-center gap-4'>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='stockName'
                                        name='stockName'
                                        value={reSearchInfo.stock_name}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="stockName" className='for_label'>Stock Name</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="text"
                                        id='stockName'
                                        name='stockName'
                                        value={reSearchInfo.stock_name}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder=''
                                    />
                                    <label htmlFor="stockName" className='for_label'>Stock Name</label>
                                </div>
                            </div>
                        </div> */}
                    </form>
                </div>
                {/* <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={handleUpload} className={'button button_ac'} type={'button'} children={'Submit'} />
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div> */}
            </div>
        </div>
    )
}

export default Research_Add_Modal