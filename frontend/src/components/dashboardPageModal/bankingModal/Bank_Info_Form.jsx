import axios from 'axios';
import JoditEditor from 'jodit-react';
import React, { useMemo, useRef, useState } from 'react'
import { apiService } from '../../../services/apiService';
import Button from '../../componentLists/Button';
import { toast } from 'sonner'


const Bank_Info_Form = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [bankInfo, setBankInfo] = useState({
        bank_name: '',
        management_type: '',
        description: '',
        color: '#000000'
    })

    const bankInfoOnchangeHandler = (e) => {
        const { name, value } = e.target;
        setBankInfo({ ...bankInfo, [name]: value })
        // if(bankInfo.bank_name) return setBankFormError('')
    }

    const paragraphFieldChanged = (data) => {
        // console.log(data)
        bankInfo.description = data
        setBankInfo({ ...bankInfo })
    }

    const editor = useRef(null);
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
            uploader: {
                insertImageAsBase64URI: true, // This helps with pasting images as base64
                url: "/api/v1/banking", // Endpoint to handle the image upload
                format: "json",
                method: "POST"
            }
        }),
        [],
    );
    const [errors, setErrors] = useState({});
    const submitBankInfo = async () => {
        // const { bank_name, management_type, description } = bankInfo

        // if (!bank_name) return setBankFormError('Bank name is required!')
        // Validate the form
        const newErrors = {};
        Object.keys(bankInfo).forEach((field) => {
            if (!bankInfo[field]) {
                newErrors[field] = `${field} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            try {
                const bankInfoResp = await apiService.postFormInfoToServer('banking', bankInfo)
                toast.success('Create Successfully')
                setBankInfo({
                    bank_name: '',
                    management_type: '',
                    description: '',
                    color: '#000000'
                })
                setErrors({});
            } catch (err) {
                toast.error(err.message)

            }
            // Add your form submission logic here
        }



    }
    return (

        <div className='absolute inset-0 bg-black/80 z-20 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-3/5 mx-auto bg-white'>
                <div className='flex w-full items-center justify-end font-medium text-xl mb-2 p-2'>
                    <p onClick={onClose} className='cursor-pointer button_cancel button'>X</p>
                </div>
                <div className='max-h-[60vh] overflow-y-auto no-scrollbar p-2'>
                    <form action="POST" className='space-y-4'>
                        <div className='flex justify-center items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    {/* <label htmlFor="bank_name" className='mb-1 inline-block'>Choose Bank name</label> */}
                                    <select name="bank_name" id="bank_name" onChange={(e) => { bankInfoOnchangeHandler(e) }}>
                                        <option value="">--Choose Bank name--</option>
                                        <option value="Axis">Axis bank</option>
                                        <option value="Canera">Canera bank</option>
                                        <option value="IDFC">IDFC bank</option>
                                        <option value="HDFC">HDFC bank</option>
                                        <option value="Allahbad">Allahbad bank</option>

                                    </select>
                                    {errors.bank_name && <p style={{ color: 'red' }}>{errors.bank_name}</p>}
                                    {/* <input className='' type="select" id='bank_name' name='bank_name' onChange={fileOnchange} /> */}
                                </div>
                            </div>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full'>
                                    <select name="management_type" id="management_type" onChange={(e) => { bankInfoOnchangeHandler(e) }}>
                                        <option value="">--Choose Management type--</option>
                                        <option value="state backing">State backing</option>
                                        <option value="Deposite growth">Deposite growth</option>
                                        <option value="Partner backing">Partner backing</option>
                                        <option value="Fixed deposite">Fixed deposite</option>
                                        <option value="Nim">Net of interest margin(NIM)</option>
                                        <option value="Regulatory">Regulatory</option>
                                        <option value="Provisions">Provisions</option>
                                        <option value="ABCD">ABCD</option>

                                    </select>
                                    {/* <label htmlFor="management_type" className='mb-1 inline-block'>Choose management types</label> */}
                                    {/* <input className='' type="select" id='management_type' name='management_type' onChange={fileOnchange} /> */}
                                </div>
                            </div>
                        </div>
                        <div className='flex justify-start items-center gap-4'>
                            <div className='w-1/2 flex items-center'>
                                <div className='w-full flex items-center gap-1'>
                                    <input type="text" value={bankInfo.color} disabled />
                                    <input type="color" name='color' onChange={(e) => { bankInfoOnchangeHandler(e) }} className='w-10 h-10 p-1' />
                                </div>
                            </div>
                        </div>
                        <div className='my-6'>
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
                    {/* {JSON.stringify(uploadedDataFromServer)} */}
                </div>
                <div className='flex justify-end items-center gap-2 mt-4 p-2'>
                    <Button onClick={() => { submitBankInfo() }} className={'button button_ac'} type="button" children={'Submit'} />
                    <Button onClick={onClose} className={'button button_cancel'} type="button" children={'Cancel'} />
                </div>
            </div>
        </div>

    )
}

export default Bank_Info_Form