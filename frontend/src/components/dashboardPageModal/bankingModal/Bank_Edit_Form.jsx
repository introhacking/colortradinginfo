import JoditEditor from 'jodit-react';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../../../services/apiService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner';

const Bank_Edit_Form = ({ isOpen, onClose, isParamsData }) => {
    if (!isOpen) return null;
    const { _id } = isParamsData

    const editor = useRef(null);

    const [bankInfo, setBankInfo] = useState({
        bank_name: '',
        description: '',
        color: ''
    })
    const [managementType, setManagementType] = useState([])

    const options = ['bold', 'italic', '|', 'ul', 'ol', '|', 'font', 'fontsize', '|', 'outdent', 'indent', 'align', '|', 'hr', '|', 'image', 'fullsize', 'brush', '|', 'table', 'link', '|', 'undo', 'redo',];
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
        }),
        [],
    );

    const [managementName, setManagementName] = useState('')
    const managementTypeOnchangeHandler = async (e) => {
        const { name, value } = e.target;
        // setBankInfo({...bankInfo , [name]:value})
        setManagementName(value)
        try {
            const getDescription = await apiService.getParamsData('/q', bankInfo.bank_name, value)
            bankInfo.description = getDescription.description
            bankInfo.color = getDescription.bgColor
            setBankInfo({ ...bankInfo })
        } catch (err) {
            console.log(err.massage)

        }
    }
    const paragraphFieldChanged = (data) => {
        bankInfo.description = data
        setBankInfo({ ...bankInfo })
    }
    const colorOnchangeHandler = (e) => {
        const { name, value } = e.target
        setBankInfo({ ...bankInfo, [name]: value })
    }

    const updatingBankDescription = async () => {
        const toUpdatingData = {
            bank_name: bankInfo.bank_name,
            management_type: managementName,
            description: bankInfo.description,
            color: bankInfo.color
        }
        try {
            const updatedData = await apiService.updatingDescriptionAndColorByName('/banking', toUpdatingData)
            if (updatedData) return toast.success(`${toUpdatingData.bank_name} bank --> ${toUpdatingData.management_type} updated successfully`)
            onClose()
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => {
        setBankInfo(isParamsData)
        setManagementType(isParamsData.management_types)
    }, [isParamsData])
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white rounded'>
                <div className='flex w-full items-center justify-between font-medium text-xl mb-2 bg-purple-500 p-2 rounded-t'>
                    <p className='font-medium text-white text-[18px]'>Updating Id : <span className='text-sm'>{_id}</span></p>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar p-2'>
                    <form action="POST" className='space-y-2 p-2'>
                        <div className='flex justify-center items-center gap-2'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full relative select-none'>
                                    <input className='for_input peer focus:ring-0 cursor-not-allowed select-none text-gray-500' readOnly={true} defaultValue={bankInfo.bank_name} type="text" id='bank_name' name='bank_name' placeholder='' />
                                    {/* <div dangerouslySetInnerHTML={{ __html: JSON.stringify(isParamsData) }} /> */}
                                    <label className='for_label'>Bank name</label>
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    <select name="management_type" id="management_type" onChange={(e) => { managementTypeOnchangeHandler(e) }}>
                                        <option value="">--Choose Management type--</option>
                                        {
                                            managementType.map(name => {
                                                return <option key={name} value={name.management_name}>{name.management_name}</option>

                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full flex items-center gap-1'>
                                    <input type="text" value={bankInfo.color} disabled />
                                    <input type="color" name='color' onChange={(e) => { colorOnchangeHandler(e) }} className='w-10 h-10 p-1' />
                                </div>
                            </div>
                        </div>
                        <div className={`my-6 ${!bankInfo.description && 'hidden'}`}>
                            <JoditEditor
                                ref={editor}
                                value={bankInfo.description}
                                tabIndex={1}
                                config={config}
                                // readonly={false}
                                minHeight={350}
                                // toolbarAdaptive={false}
                                onChange={paragraphFieldChanged} />
                        </div>
                    </form>
                </div>
                <div className='flex justify-end items-center gap-2 p-2'>
                    {/* <button onClick={() => { updatingBankDescription() }} className='px-2 py-1 bg-green-600 rounded font-medium text-white mt-4' type="button">Update</button>
                    <button onClick={onClose} className='px-2 py-1 bg-red-600 rounded font-medium text-white mt-4' type="button">Cancel</button> */}
                    <Button onClick={() => { updatingBankDescription() }} className={'button button_ac'} type="button" children={'Update'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>
    )
}

export default Bank_Edit_Form