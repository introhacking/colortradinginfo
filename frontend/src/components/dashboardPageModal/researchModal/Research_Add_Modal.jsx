import React, { useMemo, useRef, useState } from 'react'
import Button from '../../componentLists/Button';
import { apiService } from '../../../services/apiService';
import JoditEditor from 'jodit-react';
import { toast } from 'sonner';

const Research_Add_Modal = ({ isOpen, onClose, refresh }) => {
    if (!isOpen) return null;
    const [reSearchInfo, setReSearchInfo] = useState({
        stock_name: '',
        buy_sell: '',
        trigger_price: '',
        target_price: '',
        stop_loss: '',
        chart: '',
        chartPreview: null,
        rationale: ''
    })
    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'chart') {
            // Set file
            setReSearchInfo(prev => ({
                ...prev,
                [name]: files[0]
            }));


            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result is a base64 string like: data:image/png;base64,...
                setReSearchInfo((prev) => ({
                    ...prev,
                    chartPreview: reader.result
                }));
            };

            reader.readAsDataURL(files[0]);
        } else if (['trigger_price', 'target_price', 'stop_loss'].includes(name)) {
            // Allow only numbers and decimal points
            const numericValue = value.replace(/[^0-9.]/g, '');

            setReSearchInfo(prevState => ({
                ...prevState,
                [name]: numericValue
            }));
        } else {
            setReSearchInfo(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const rationaleFieldChanged = (text) => {
        reSearchInfo.rationale = text
        setReSearchInfo({ ...reSearchInfo })
    }

    const editor = useRef(null);
    const options = ['bold', 'italic', '|', 'ul', 'ol', '|', 'font', 'fontsize', '|', 'outdent', 'indent', 'align', '|', 'hr', '|', 'fullsize', 'brush', '|', 'table', 'link', '|', 'undo', 'redo',];

    const config = useMemo(
        () => ({
            readonly: false,
            placeholder: '',
            defaultActionOnPaste: 'insert_as_html',
            defaultLineHeight: 1.5,
            enter: 'div',
            // options that we defined in above step.
            buttons: options,
            buttonsMD: options,
            buttonsSM: options,
            buttonsXS: options,
            statusbar: false,
            sizeLG: 900,
            sizeMD: 700,
            sizeSM: 400,
            toolbarAdaptive: false,
            uploader: {
                insertImageAsBase64URI: true, // This helps with pasting images as base64
                format: "json",
                method: "POST"
            }
        }),
        [],
    );

    const getUserInfo = async () => {
        const loginInfoStr = localStorage.getItem('loginInfo');
        if (loginInfoStr) {
            try {
                const loginInfo = JSON.parse(loginInfoStr);
                return loginInfo?.user?.username || null;
            } catch (e) {
                console.error("Invalid loginInfo format");
            }
        }
        return null;
    };

    const handleUpload = async () => {
        try {
            const createdBy = await getUserInfo();
            const formData = new FormData();
            formData.append('stockName', reSearchInfo.stock_name);
            formData.append('buy_sell', reSearchInfo.buy_sell);
            formData.append('trigger_price', reSearchInfo.trigger_price);
            formData.append('target_price', reSearchInfo.target_price);
            formData.append('stop_loss', reSearchInfo.stop_loss);
            formData.append('rationale', reSearchInfo.rationale);
            formData.append('chart', reSearchInfo.chart);
            formData.append('createdBy', createdBy);
            const serverResponse = await apiService.postFormInfoToServer('research', formData)
            toast.success(serverResponse.message)
            refresh()
            setReSearchInfo({
                stock_name: '',
                buy_sell: '',
                trigger_price: '',
                target_price: '',
                stop_loss: '',
                chart: '',
                chartPreview: null,
                rationale: ''
            })
        } catch (error) {
            console.error('Error uploading:', error);
        }
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
                                    <label htmlFor="stock_name" className='for_label'>Stock Name (NSE Name)</label>
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
                                        inputMode="decimal"
                                        pattern="[0-9]*"
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
                                        inputMode="decimal"
                                        pattern="[0-9]*"
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
                                        inputMode="decimal"
                                        pattern="[0-9]*"
                                        placeholder=''
                                    />
                                    <label htmlFor="stop_loss" className='for_label'>Stop Loss</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center mt-2'>
                                <div className='w-full relative'>
                                    <input
                                        className='for_input peer'
                                        type="file"
                                        id='chart'
                                        name='chart'
                                        onChange={handleInputChange}
                                        placeholder='Upload chart image'
                                    />
                                    <label htmlFor="chart" className='for_label'>Chart Image</label>
                                </div>
                            </div>
                        </div>
                        {reSearchInfo.chart && (
                            <div className="mt-2">
                                <p>Image Preview:</p>
                                <img
                                    src={reSearchInfo.chartPreview}
                                    alt="Chart preview"
                                    className="max-h-40 max-w-40 border rounded shadow"
                                />
                            </div>
                        )}

                        {/* {reSearchInfo.chart && (
                            <div>
                                <p>Img Preview : </p>
                                <img
                                    src={reSearchInfo.chart}
                                    alt="Chart preview"
                                    className="max-h-40 max-w-40 border rounded shadow"
                                />
                            </div>
                        )} */}
                        {/* <fieldset> */}
                        <fieldset className='border border-gray-300 p-2 mb-6 rounded'>
                            <legend className='text-gray-500 text-sm'>Rationale</legend>
                            <JoditEditor
                                ref={editor}
                                value={reSearchInfo.rationale}
                                tabIndex={1}
                                config={config}
                                minHeight={350}
                                onChange={rationaleFieldChanged} />
                        </fieldset>
                        {/* </fieldset> */}
                    </form>
                </div>
                <div className='flex gap-2 justify-end p-2'>
                    <Button onClick={handleUpload} className={'button button_ac'} type={'button'} children={'Submit'} />
                    <Button onClick={onClose} className={'button button_cancel'} type={'button'} children={'Cancel'} />
                </div>
            </div >
        </div >
    )
}

export default Research_Add_Modal