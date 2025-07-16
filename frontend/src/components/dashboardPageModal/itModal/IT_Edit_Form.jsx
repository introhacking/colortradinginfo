import JoditEditor from 'jodit-react';
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { apiService } from '../../../services/apiService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner';

const IT_Edit_Form = ({ isOpen, onClose, isParamsData }) => {

    if (!isOpen) return null;
    const editor = useRef(null);
    const [ITInfo, setITInfo] = useState({
        name: '',
        description: '',
        color: ''
    })

    const [ITType, setITType] = useState([])

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

    const [itName, setITName] = useState('')
    const ITTypeOnchangeHandler = async (e) => {
        const { name, value } = e.target;
        // setITInfo({...ITInfo , [name]:value})
        setITName(value)
        try {
            const getDescription = await apiService.getITParamsData('/itq', ITInfo.name, value)
            // console.log(getDescription)
            ITInfo.description = getDescription.description
            ITInfo.color = getDescription.bgColor
            setITInfo({ ...ITInfo })
        } catch (err) {
            console.log(err.massage)

        }
    }
    const paragraphFieldChanged = (data) => {
        ITInfo.description = data
        setITInfo({ ...ITInfo })
    }
    const colorOnchangeHandler = (e) => {
        const { name, value } = e.target
        setITInfo({ ...ITInfo, [name]: value })
    }

    const updatingBankDescription = async () => {
        const toUpdatingData = {
            it_name: ITInfo.name,
            it_type: itName,
            description: ITInfo.description,
            bg_color:ITInfo.color
        }
        try {
            const updatedData = await apiService.updatingDescriptionAndColorByName('itCreate', toUpdatingData)
            if(updatedData) return toast.success(`${toUpdatingData.it_name} --> ${toUpdatingData.it_type} updated successfully`)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        const customModifiedData = {
            name: isParamsData.it_name,
            description: isParamsData.description,
            // bg_color: ITInfo.color
        }
        setITInfo(customModifiedData)
        setITType(isParamsData.it_types)
    }, [isParamsData])
    return (
        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex w-full items-center justify-end font-medium text-xl mb-2 p-2'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='h-[60vh] overflow-y-auto no-scrollbar p-2'>
                    <form action="POST" className='space-y-2 p-2'>
                        <div className='flex justify-center items-center gap-2'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full select-none'>
                                    <input className='bg-gray-100 cursor-not-allowed select-none hover:opacity-45' readOnly={true} defaultValue={ITInfo.name} type="text" id='name' name='name' />
                                    {/* <div dangerouslySetInnerHTML={{ __html: JSON.stringify(isParamsData) }} /> */}
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    <select name="it_type" id="it_type" onChange={(e) => { ITTypeOnchangeHandler(e) }}>
                                        <option value="">--Choose IT type--</option>
                                        {
                                            ITType.map(name => {
                                                return <option key={name} value={name.name}>{name.name}</option>

                                            })
                                        }
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full flex items-center gap-1'>
                                    <input type="text" value={ITInfo.color} disabled />
                                    <input type="color" name='color' className='w-10 h-10 p-1' onChange={colorOnchangeHandler} />
                                </div>
                            </div>
                        </div>
                        <div className={`my-6 ${!ITInfo.description && 'hidden'}`}>
                            <JoditEditor
                                ref={editor}
                                value={ITInfo.description}
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

export default IT_Edit_Form